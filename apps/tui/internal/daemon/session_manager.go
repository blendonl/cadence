package daemon

import (
	"context"
	"fmt"
	"sync"
	"time"

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
) *SessionManager {
	return &SessionManager{
		config:         config,
		backendClient:  backendClient,
		sessionTracker: sessionTracker,
		changeWatcher:  changeWatcher,
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

	projects, err := sm.backendClient.ListProjects(ctx, 1, 100)
	if err != nil {
		return
	}

	for _, p := range projects.Items {
		if p.FilePath != nil && *p.FilePath == workingDir {
			session.SetMetadata("project_id", p.ID)
			return
		}
	}
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
