package main

import (
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"

	"cadence/cmd/cadence/commands"
	"cadence/internal/daemon"
	"cadence/internal/infrastructure/auth"
	"cadence/internal/infrastructure/config"
	"cadence/tui/app"
	"cadence/tui/kanban"
	"cadence/tui/style"
)

var initialTab int

var rootCmd = &cobra.Command{
	Use:   "cadence",
	Short: "Cadence - unified project management TUI",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI(initialTab)
	},
}

var kanbanCmd = &cobra.Command{
	Use:   "kanban",
	Short: "Open the kanban board view",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI(app.TabKanban)
	},
}

var notesCmd = &cobra.Command{
	Use:   "notes",
	Short: "Open the notes view",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI(app.TabNotes)
	},
}

var agendaCmd = &cobra.Command{
	Use:   "agenda",
	Short: "Open the agenda view",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runTUI(app.TabAgenda)
	},
}

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show daemon status and active timers",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runStatus()
	},
}

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with Google OAuth",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runLogin()
	},
}

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Remove stored authentication token",
	RunE: func(cmd *cobra.Command, args []string) error {
		return runLogout()
	},
}

func init() {
	rootCmd.AddCommand(kanbanCmd)
	rootCmd.AddCommand(notesCmd)
	rootCmd.AddCommand(agendaCmd)
	rootCmd.AddCommand(statusCmd)
	rootCmd.AddCommand(loginCmd)
	rootCmd.AddCommand(logoutCmd)

	commands.RegisterCommands(rootCmd)
}

func ensureAuth(cfg *config.Config) error {
	tokenStore, err := auth.NewTokenStore()
	if err != nil {
		return fmt.Errorf("failed to create token store: %w", err)
	}

	if tokenStore.Exists() {
		return nil
	}

	fmt.Println("No authentication token found. Starting login...")
	flow := auth.NewOAuthFlow(cfg.Backend.URL, tokenStore)
	if err := flow.Execute(); err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	fmt.Println("Login successful!")

	daemonClient := daemon.NewClient(cfg)
	if daemonClient.IsHealthy() {
		daemonClient.SendRequest(daemon.RequestReloadToken, nil)
	}

	return nil
}

func runTUI(tab int) error {
	loader, err := config.NewLoader()
	if err != nil {
		return fmt.Errorf("failed to create config loader: %w", err)
	}

	cfg, err := loader.Load()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	if err := ensureAuth(cfg); err != nil {
		return err
	}

	style.InitStyles(cfg)
	kanban.InitKeybindings(cfg)

	daemonClient := daemon.NewClient(cfg)

	model := app.NewAppModel(cfg, daemonClient, tab)
	p := tea.NewProgram(model, tea.WithAltScreen())

	if _, err := p.Run(); err != nil {
		return fmt.Errorf("TUI error: %w", err)
	}

	return nil
}

func runLogin() error {
	loader, err := config.NewLoader()
	if err != nil {
		return fmt.Errorf("failed to create config loader: %w", err)
	}

	cfg, err := loader.Load()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	tokenStore, err := auth.NewTokenStore()
	if err != nil {
		return fmt.Errorf("failed to create token store: %w", err)
	}

	flow := auth.NewOAuthFlow(cfg.Backend.URL, tokenStore)
	if err := flow.Execute(); err != nil {
		return fmt.Errorf("login failed: %w", err)
	}

	fmt.Println("Login successful!")

	daemonClient := daemon.NewClient(cfg)
	if daemonClient.IsHealthy() {
		daemonClient.SendRequest(daemon.RequestReloadToken, nil)
	}

	return nil
}

func runLogout() error {
	tokenStore, err := auth.NewTokenStore()
	if err != nil {
		return fmt.Errorf("failed to create token store: %w", err)
	}

	if err := tokenStore.Clear(); err != nil {
		return fmt.Errorf("logout failed: %w", err)
	}

	fmt.Println("Logged out successfully.")
	return nil
}

func runStatus() error {
	loader, err := config.NewLoader()
	if err != nil {
		return fmt.Errorf("failed to create config loader: %w", err)
	}

	cfg, err := loader.Load()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	client := daemon.NewClient(cfg)

	if !client.IsHealthy() {
		fmt.Println("Daemon: not running")
		return nil
	}

	fmt.Println("Daemon: running")
	return nil
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
