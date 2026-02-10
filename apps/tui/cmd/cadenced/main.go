package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
	"cadence/internal/infrastructure/external"
)

func main() {
	loader, err := config.NewLoader()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create config loader: %v\n", err)
		os.Exit(1)
	}

	cfg, err := loader.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	server, err := daemon.NewServer(cfg)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to create server: %v\n", err)
		os.Exit(1)
	}

	server.SetSessionTracker(external.NewTmuxSessionTracker())
	server.SetVCSProvider(external.NewGitVCSProvider())

	changeWatcher, err := external.NewFSNotifyWatcher()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Warning: failed to create change watcher: %v\n", err)
	} else {
		server.SetChangeWatcher(changeWatcher)
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		fmt.Println("\nShutting down daemon...")
		if err := server.Stop(); err != nil {
			fmt.Fprintf(os.Stderr, "Error stopping server: %v\n", err)
		}
		os.Exit(0)
	}()

	if err := server.Start(); err != nil {
		fmt.Fprintf(os.Stderr, "Daemon error: %v\n", err)
		os.Exit(1)
	}
}
