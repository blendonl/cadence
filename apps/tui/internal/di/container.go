package di

import (
	"fmt"
	"time"

	"cadence/internal/domain/service"
	"cadence/internal/infrastructure/config"
	"cadence/internal/infrastructure/external"
	"cadence/internal/infrastructure/httpclient"
)

type Container struct {
	Config         *config.Config
	BackendClient  *httpclient.BackendClient
	SessionTracker service.SessionTracker
	VCSProvider    service.VCSProvider
	ChangeWatcher  service.ChangeWatcher
}

func NewContainer() (*Container, error) {
	loader, err := config.NewLoader()
	if err != nil {
		return nil, fmt.Errorf("failed to create config loader: %w", err)
	}

	cfg, err := loader.Load()
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	timeout := time.Duration(cfg.Backend.Timeout) * time.Second
	backendClient := httpclient.NewBackendClient(cfg.Backend.URL, timeout)

	sessionTracker := external.NewTmuxSessionTracker()
	vcsProvider := external.NewGitVCSProvider()

	changeWatcher, err := external.NewFSNotifyWatcher()
	if err != nil {
		return nil, fmt.Errorf("failed to create change watcher: %w", err)
	}

	return &Container{
		Config:         cfg,
		BackendClient:  backendClient,
		SessionTracker: sessionTracker,
		VCSProvider:    vcsProvider,
		ChangeWatcher:  changeWatcher,
	}, nil
}
