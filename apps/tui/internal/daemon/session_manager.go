package daemon

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"cadence/internal/application/dto"
	"cadence/internal/domain/entity"
	"cadence/internal/domain/service"
	"cadence/internal/infrastructure/config"
	"cadence/internal/infrastructure/httpclient"
)

type SessionManager struct {
	config         *config.Config
	backendClient  *httpclient.BackendClient
	sessionTracker service.SessionTracker
	changeWatcher  service.ChangeWatcher
	vcsProvider    service.VCSProvider
	activeSession  *entity.Session
	watchedPaths   map[string]bool
	mu             sync.RWMutex
	stopChan       chan struct{}
	stopped        bool
}

func NewSessionManager(
	config *config.Config,
	backendClient *httpclient.BackendClient,
	sessionTracker service.SessionTracker,
	changeWatcher service.ChangeWatcher,
	vcsProvider service.VCSProvider,
) *SessionManager {
	return &SessionManager{
		config:         config,
		backendClient:  backendClient,
		sessionTracker: sessionTracker,
		changeWatcher:  changeWatcher,
		vcsProvider:    vcsProvider,
		watchedPaths:   make(map[string]bool),
		stopChan:       make(chan struct{}),
		stopped:        false,
	}
}

func (sm *SessionManager) Start(ctx context.Context) error {
	if !sm.config.SessionTracking.Enabled {
		fmt.Println("[SessionManager] Session tracking is disabled in config")
		return nil
	}

	if !sm.sessionTracker.IsAvailable() {
		fmt.Println("[SessionManager] Session tracker is not available (tmux may not be running)")
		return nil
	}

	fmt.Printf("[SessionManager] Starting session tracking (poll interval: %ds)\n", sm.config.SessionTracking.PollInterval)

	sm.syncSessions(ctx)
	go sm.pollLoop(ctx)

	return nil
}

func (sm *SessionManager) Stop() error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if sm.stopped {
		return nil
	}

	sm.stopped = true
	close(sm.stopChan)

	if sm.changeWatcher != nil {
		if err := sm.changeWatcher.Close(); err != nil {
			return fmt.Errorf("failed to close change watcher: %w", err)
		}
	}

	return nil
}

func (sm *SessionManager) GetActiveSession() *entity.Session {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	return sm.activeSession
}

func (sm *SessionManager) pollLoop(ctx context.Context) {
	pollInterval := time.Duration(sm.config.SessionTracking.PollInterval) * time.Second
	ticker := time.NewTicker(pollInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			sm.syncSessions(ctx)
		case <-sm.stopChan:
			return
		case <-ctx.Done():
			return
		}
	}
}

func (sm *SessionManager) syncSessions(ctx context.Context) {
	activeSession, err := sm.sessionTracker.GetActiveSession()
	if err != nil {
		fmt.Printf("[SessionManager] Error getting active session: %v\n", err)
		return
	}

	sm.mu.Lock()
	previousSession := sm.activeSession
	sm.activeSession = activeSession
	sm.mu.Unlock()

	if previousSession == nil && activeSession != nil {
		fmt.Printf("[SessionManager] Active session detected: %s (working dir: %s)\n",
			activeSession.Name(), activeSession.WorkingDir())
	} else if previousSession != nil && activeSession == nil {
		fmt.Printf("[SessionManager] Active session ended: %s\n", previousSession.Name())
	} else if previousSession != nil && activeSession != nil && previousSession.Name() != activeSession.Name() {
		fmt.Printf("[SessionManager] Active session changed: %s -> %s (working dir: %s)\n",
			previousSession.Name(), activeSession.Name(), activeSession.WorkingDir())
	}

	if sm.config.SessionTracking.GitSync.WatchForChanges && activeSession != nil {
		sm.setupWatcher(activeSession)
	}

	if activeSession != nil {
		sm.resolveProjectForSession(ctx, activeSession)
	}
}

func (sm *SessionManager) resolveProjectForSession(ctx context.Context, session *entity.Session) {
	workingDir := session.WorkingDir()
	if workingDir == "" {
		return
	}

	// Derive project name and repo root from VCS
	var projectName, repoRoot string
	if sm.vcsProvider != nil && sm.vcsProvider.IsRepository(workingDir) {
		root, err := sm.vcsProvider.GetRepositoryRoot(workingDir)
		if err == nil && root != "" {
			repoRoot = root
			projectName = filepath.Base(repoRoot)
		}
	}
	if projectName == "" {
		projectName = filepath.Base(workingDir)
		repoRoot = workingDir
	}

	// Derive board name from monorepo structure
	boardName := "default"
	relPath, err := filepath.Rel(repoRoot, workingDir)
	if err == nil && relPath != "." {
		parts := strings.Split(relPath, string(filepath.Separator))
		if len(parts) >= 2 && (parts[0] == "apps" || parts[0] == "packages") {
			boardName = parts[1]
		}
	}

	// Find or create project
	project, err := sm.findOrCreateProject(ctx, projectName)
	if err != nil {
		fmt.Printf("[SessionManager] Error resolving project: %v\n", err)
		return
	}
	session.SetMetadata("project_id", project.ID)

	// Find or create board
	board, err := sm.findOrCreateBoard(ctx, boardName, project.ID)
	if err != nil {
		fmt.Printf("[SessionManager] Error resolving board: %v\n", err)
		return
	}
	session.SetMetadata("board_id", board.ID)

	fmt.Printf("[SessionManager] Resolved project=%q board=%q for %s\n", project.Name, board.Name, workingDir)
}

func (sm *SessionManager) findOrCreateProject(ctx context.Context, name string) (*dto.ProjectDto, error) {
	projects, err := sm.backendClient.ListProjects(ctx, 1, 100)
	if err != nil {
		return nil, fmt.Errorf("listing projects: %w", err)
	}

	for i := range projects.Items {
		if strings.EqualFold(projects.Items[i].Name, name) {
			return &projects.Items[i], nil
		}
	}

	project, err := sm.backendClient.CreateProject(ctx, dto.ProjectCreateRequest{Name: name})
	if err != nil {
		return nil, fmt.Errorf("creating project %q: %w", name, err)
	}
	fmt.Printf("[SessionManager] Created project %q (%s)\n", project.Name, project.ID)
	return project, nil
}

func (sm *SessionManager) findOrCreateBoard(ctx context.Context, name, projectID string) (*dto.BoardDto, error) {
	boards, err := sm.backendClient.ListBoards(ctx, 1, 100, projectID, "")
	if err != nil {
		return nil, fmt.Errorf("listing boards: %w", err)
	}

	for i := range boards.Items {
		if strings.EqualFold(boards.Items[i].Name, name) {
			return &boards.Items[i], nil
		}
	}

	board, err := sm.backendClient.CreateBoard(ctx, dto.BoardCreateRequest{Name: name, ProjectID: projectID})
	if err != nil {
		return nil, fmt.Errorf("creating board %q: %w", name, err)
	}
	fmt.Printf("[SessionManager] Created board %q (%s)\n", board.Name, board.ID)
	return board, nil
}

func (sm *SessionManager) setupWatcher(session *entity.Session) {
	if sm.changeWatcher == nil {
		return
	}

	watchPath := session.WorkingDir()
	if watchPath == "" {
		return
	}

	sm.mu.RLock()
	alreadyWatching := sm.watchedPaths[watchPath]
	sm.mu.RUnlock()

	if alreadyWatching {
		return
	}

	callback := func() {
		fmt.Printf("[SessionManager] File changes detected in: %s\n", watchPath)
	}

	if err := sm.changeWatcher.Watch(watchPath, callback); err != nil {
		fmt.Printf("[SessionManager] Error setting up watcher for %s: %v\n", watchPath, err)
		return
	}

	fmt.Printf("[SessionManager] Now watching for changes in: %s\n", watchPath)

	sm.mu.Lock()
	sm.watchedPaths[watchPath] = true
	sm.mu.Unlock()
}
