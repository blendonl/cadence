package daemon

import (
	"context"
	"fmt"
	"regexp"
	"sync"
	"time"

	"github.com/google/uuid"

	"cadence/internal/application/dto"
	"cadence/internal/domain/entity"
	"cadence/internal/domain/service"
	"cadence/internal/infrastructure/config"
	"cadence/internal/infrastructure/httpclient"
)

type TimeTrackingManager struct {
	config         *config.Config
	backendClient  *httpclient.BackendClient
	sessionTracker service.SessionTracker
	vcsProvider    service.VCSProvider

	activeTimers     map[string]*entity.TimeLog
	autoTimers       map[string]*entity.TimeLog
	currentProjectID string
	currentTaskID    string

	mu       sync.RWMutex
	stopChan chan struct{}
	stopped  bool
}

func NewTimeTrackingManager(
	config *config.Config,
	backendClient *httpclient.BackendClient,
	sessionTracker service.SessionTracker,
	vcsProvider service.VCSProvider,
) *TimeTrackingManager {
	return &TimeTrackingManager{
		config:         config,
		backendClient:  backendClient,
		sessionTracker: sessionTracker,
		vcsProvider:    vcsProvider,
		activeTimers:   make(map[string]*entity.TimeLog),
		autoTimers:     make(map[string]*entity.TimeLog),
		stopChan:       make(chan struct{}),
		stopped:        false,
	}
}

func (tm *TimeTrackingManager) Start(ctx context.Context) error {
	if !tm.config.TimeTracking.Enabled {
		fmt.Println("[TimeTrackingManager] Time tracking is disabled in config")
		return nil
	}

	if tm.sessionTracker == nil || !tm.sessionTracker.IsAvailable() {
		fmt.Println("[TimeTrackingManager] Session tracker not available")
		return nil
	}

	fmt.Println("[TimeTrackingManager] Starting time tracking")
	go tm.pollLoop(ctx)

	return nil
}

func (tm *TimeTrackingManager) Stop() error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if tm.stopped {
		return nil
	}

	tm.stopped = true
	close(tm.stopChan)

	ctx := context.Background()
	for _, timer := range tm.autoTimers {
		if timer.IsRunning() {
			_ = timer.Stop(time.Now())
			tm.sendTimeLogToBackend(ctx, timer)
		}
	}

	return nil
}

func (tm *TimeTrackingManager) StartTimer(ctx context.Context, projectID, taskID, description string) (*entity.TimeLog, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	key := projectID
	if taskID != "" {
		key = taskID
	}

	if existing, ok := tm.activeTimers[key]; ok && existing.IsRunning() {
		return existing, nil
	}

	id := uuid.New().String()
	log, err := entity.NewTimeLog(id, projectID, entity.TimeLogSourceTimer, time.Now())
	if err != nil {
		return nil, err
	}

	if taskID != "" {
		log.SetTaskID(taskID)
	}
	if description != "" {
		log.SetDescription(description)
	}

	tm.activeTimers[key] = log
	fmt.Printf("[TimeTrackingManager] Started timer for %s\n", key)

	return log, nil
}

func (tm *TimeTrackingManager) StopTimer(ctx context.Context, projectID, taskID string) (*entity.TimeLog, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	key := projectID
	if taskID != "" {
		key = taskID
	}

	timer, ok := tm.activeTimers[key]
	if !ok || !timer.IsRunning() {
		return nil, entity.ErrTimeLogNotFound
	}

	if err := timer.Stop(time.Now()); err != nil {
		return nil, err
	}

	tm.sendTimeLogToBackend(ctx, timer)

	delete(tm.activeTimers, key)
	fmt.Printf("[TimeTrackingManager] Stopped timer for %s (duration: %s)\n", key, timer.Duration())

	return timer, nil
}

func (tm *TimeTrackingManager) GetActiveTimers() []*entity.TimeLog {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	timers := make([]*entity.TimeLog, 0, len(tm.activeTimers)+len(tm.autoTimers))
	for _, t := range tm.activeTimers {
		if t.IsRunning() {
			timers = append(timers, t)
		}
	}
	for _, t := range tm.autoTimers {
		if t.IsRunning() {
			timers = append(timers, t)
		}
	}
	return timers
}

func (tm *TimeTrackingManager) pollLoop(ctx context.Context) {
	tm.syncAutoTracking(ctx)

	pollInterval := time.Duration(tm.config.SessionTracking.PollInterval) * time.Second
	if pollInterval == 0 {
		pollInterval = 5 * time.Second
	}
	ticker := time.NewTicker(pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			tm.syncAutoTracking(ctx)
		case <-tm.stopChan:
			return
		case <-ctx.Done():
			return
		}
	}
}

func (tm *TimeTrackingManager) syncAutoTracking(ctx context.Context) {
	if !tm.config.TimeTracking.AutoTrack {
		return
	}

	activeSession, err := tm.sessionTracker.GetActiveSession()
	if err != nil || activeSession == nil {
		tm.pauseAutoTimers(ctx)
		return
	}

	projectID, taskID := tm.detectProjectAndTask(ctx, activeSession)

	tm.mu.Lock()
	defer tm.mu.Unlock()

	projectChanged := tm.currentProjectID != projectID
	taskChanged := tm.currentTaskID != taskID

	if projectChanged || taskChanged {
		tm.pauseAutoTimersLocked(ctx)

		tm.currentProjectID = projectID
		tm.currentTaskID = taskID

		if projectID != "" {
			tm.startAutoTimerLocked(ctx, projectID, taskID)
		}
	}
}

func (tm *TimeTrackingManager) detectProjectAndTask(ctx context.Context, session *entity.Session) (string, string) {
	workingDir := session.WorkingDir()
	if workingDir == "" {
		return "", ""
	}

	projects, err := tm.backendClient.ListProjects(ctx, 1, 100)
	if err != nil {
		return "", ""
	}

	var matchedProjectID string
	for _, p := range projects.Items {
		if p.FilePath != nil && *p.FilePath == workingDir {
			matchedProjectID = p.ID
			break
		}
	}

	if matchedProjectID == "" {
		return "", ""
	}

	var taskID string
	if tm.vcsProvider != nil {
		branch, err := tm.vcsProvider.GetCurrentBranch(workingDir)
		if err == nil && branch != "" {
			taskID = tm.extractTaskIDFromBranch(branch)
		}
	}

	return matchedProjectID, taskID
}

func (tm *TimeTrackingManager) extractTaskIDFromBranch(branch string) string {
	patterns := []string{
		`^(?:feature|bugfix|fix|hotfix|chore|refactor)/([A-Z]{3}-\d+-[a-z0-9-]+)`,
		`([A-Z]{3}-\d+-[a-z0-9-]+)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(branch)
		if len(matches) > 1 {
			return matches[1]
		}
	}

	return ""
}

func (tm *TimeTrackingManager) pauseAutoTimers(ctx context.Context) {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	tm.pauseAutoTimersLocked(ctx)
}

func (tm *TimeTrackingManager) pauseAutoTimersLocked(ctx context.Context) {
	for key, timer := range tm.autoTimers {
		if timer.IsRunning() {
			_ = timer.Stop(time.Now())
			tm.sendTimeLogToBackend(ctx, timer)
			fmt.Printf("[TimeTrackingManager] Auto-paused timer for %s\n", key)
		}
	}
	tm.autoTimers = make(map[string]*entity.TimeLog)
	tm.currentProjectID = ""
	tm.currentTaskID = ""
}

func (tm *TimeTrackingManager) startAutoTimerLocked(ctx context.Context, projectID, taskID string) {
	key := projectID
	if taskID != "" {
		key = taskID
	}

	if _, hasManual := tm.activeTimers[key]; hasManual {
		return
	}

	id := uuid.New().String()
	log, err := entity.NewTimeLog(id, projectID, entity.TimeLogSourceTmux, time.Now())
	if err != nil {
		return
	}

	if taskID != "" {
		log.SetTaskID(taskID)
	}
	log.SetMetadata("session_type", "tmux")
	log.SetMetadata("auto_tracked", "true")

	tm.autoTimers[key] = log

	if taskID != "" {
		fmt.Printf("[TimeTrackingManager] Auto-started timer for project %s, task %s\n", projectID, taskID)
	} else {
		fmt.Printf("[TimeTrackingManager] Auto-started timer for project %s\n", projectID)
	}
}

func (tm *TimeTrackingManager) sendTimeLogToBackend(ctx context.Context, log *entity.TimeLog) {
	startTime := log.StartTime().Format(time.RFC3339)
	durationSecs := int(log.Duration().Seconds())

	projectID := log.ProjectID()
	req := dto.TimeLogCreateRequest{
		ProjectID:   &projectID,
		StartTime:   startTime,
		Duration:    &durationSecs,
	}

	if log.TaskID() != "" {
		taskID := log.TaskID()
		req.TaskID = &taskID
	}

	if log.Description() != "" {
		desc := log.Description()
		req.Description = &desc
	}

	if log.EndTime() != nil {
		endTime := log.EndTime().Format(time.RFC3339)
		req.EndTime = &endTime
	}

	if _, err := tm.backendClient.CreateTimeLog(ctx, req); err != nil {
		fmt.Printf("[TimeTrackingManager] Failed to send time log to backend: %v\n", err)
	}
}
