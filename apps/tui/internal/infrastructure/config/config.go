package config

import (
	"fmt"
	"os"
	"path/filepath"

	"cadence/internal/buildinfo"

	"gopkg.in/yaml.v3"
)

const (
	defaultConfigFileName = "config.yml"
	defaultConfigDirName  = ".config/cadence"
	defaultDataDirName    = ".local/share/cadence"
)

type Config struct {
	Backend         BackendConfig         `yaml:"backend"`
	Daemon          DaemonConfig          `yaml:"daemon"`
	TUI             TUIConfig             `yaml:"tui"`
	Keybindings     KeybindingsConfig     `yaml:"keybindings"`
	SessionTracking SessionTrackingConfig `yaml:"session_tracking"`
	TimeTracking    TimeTrackingConfig    `yaml:"time_tracking"`
}

type BackendConfig struct {
	URL     string `yaml:"-"` // Not stored in config, set via environment variable
	Timeout int    `yaml:"timeout"`
}

type DaemonConfig struct {
	SocketDir  string `yaml:"socket_dir"`
	SocketName string `yaml:"socket_name"`
}

type TUIConfig struct {
	Styles StylesConfig `yaml:"styles"`
}

type StylesConfig struct {
	Column           ColumnStyle    `yaml:"column"`
	FocusedColumn    ColumnStyle    `yaml:"focused_column"`
	ColumnTitle      TextStyle      `yaml:"column_title"`
	Task             TextStyle      `yaml:"task"`
	SelectedTask     TextStyle      `yaml:"selected_task"`
	Help             TextStyle      `yaml:"help"`
	TaskCard         TaskCardStyle  `yaml:"task_card"`
	SelectedTaskCard TaskCardStyle  `yaml:"selected_task_card"`
	Description      TextStyle      `yaml:"description"`
	Tag              TextStyle      `yaml:"tag"`
	DueDate          TextStyle      `yaml:"due_date"`
	Overdue          TextStyle      `yaml:"overdue"`
	Priority         PriorityColors `yaml:"priority"`
	DueDateUrgency   DueDateColors  `yaml:"due_date_urgency"`
	ScrollIndicator  TextStyle      `yaml:"scroll_indicator"`
}

type ColumnStyle struct {
	PaddingVertical   int    `yaml:"padding_vertical"`
	PaddingHorizontal int    `yaml:"padding_horizontal"`
	BorderStyle       string `yaml:"border_style"`
	BorderColor       string `yaml:"border_color"`
}

type TextStyle struct {
	Foreground        string `yaml:"foreground,omitempty"`
	Background        string `yaml:"background,omitempty"`
	Bold              bool   `yaml:"bold,omitempty"`
	Italic            bool   `yaml:"italic,omitempty"`
	PaddingVertical   int    `yaml:"padding_vertical,omitempty"`
	PaddingHorizontal int    `yaml:"padding_horizontal,omitempty"`
	Align             string `yaml:"align,omitempty"`
}

type TaskCardStyle struct {
	BorderColor string `yaml:"border_color"`
}

type PriorityColors struct {
	High    string `yaml:"high"`
	Medium  string `yaml:"medium"`
	Low     string `yaml:"low"`
	Default string `yaml:"default"`
}

type DueDateColors struct {
	Overdue   string `yaml:"overdue"`
	DueSoon   string `yaml:"due_soon"`
	Upcoming  string `yaml:"upcoming"`
	FarFuture string `yaml:"far_future"`
}

type KeybindingsConfig struct {
	Up        []string `yaml:"up"`
	Down      []string `yaml:"down"`
	Left      []string `yaml:"left"`
	Right     []string `yaml:"right"`
	MoveLeft  []string `yaml:"move_left"`
	MoveRight []string `yaml:"move_right"`
	Add       []string `yaml:"add"`
	Edit      []string `yaml:"edit"`
	Delete    []string `yaml:"delete"`
	Quit      []string `yaml:"quit"`
}

type SessionTrackingConfig struct {
	Enabled          bool          `yaml:"enabled"`
	PollInterval     int           `yaml:"poll_interval"`
	TrackerType      string        `yaml:"tracker_type"`
	GeneralBoardName string        `yaml:"general_board_name"`
	GitSync          GitSyncConfig `yaml:"git_sync"`
}

type GitSyncConfig struct {
	Enabled          bool `yaml:"enabled"`
	AutoSyncBranches bool `yaml:"auto_sync_branches"`
	WatchForChanges  bool `yaml:"watch_for_changes"`
}

type TimeTrackingConfig struct {
	Enabled       bool                      `yaml:"enabled"`
	AutoTrack     bool                      `yaml:"auto_track"`
	Sources       TimeTrackingSourcesConfig `yaml:"sources"`
	Git           TimeTrackingGitConfig     `yaml:"git"`
	Tmux          TimeTrackingTmuxConfig    `yaml:"tmux"`
	IdleThreshold int                       `yaml:"idle_threshold"`
}

type TimeTrackingSourcesConfig struct {
	Manual bool `yaml:"manual"`
	Git    bool `yaml:"git"`
	Tmux   bool `yaml:"tmux"`
}

type TimeTrackingGitConfig struct {
	WatchBranches bool   `yaml:"watch_branches"`
	BranchPattern string `yaml:"branch_pattern"`
}

type TimeTrackingTmuxConfig struct {
	TrackActiveOnly bool `yaml:"track_active_only"`
}

type Loader struct {
	configPath string
}

func NewLoader() (*Loader, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	configDir := filepath.Join(homeDir, defaultConfigDirName)
	configPath := filepath.Join(configDir, defaultConfigFileName)

	return &Loader{configPath: configPath}, nil
}

func (l *Loader) Load() (*Config, error) {
	if _, err := os.Stat(l.configPath); os.IsNotExist(err) {
		return l.createDefaultConfig()
	}

	data, err := os.ReadFile(l.configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	if buildinfo.BackendURL == "" {
		return nil, fmt.Errorf("backend URL not set (binary must be built with -ldflags)")
	}
	config.Backend.URL = buildinfo.BackendURL

	if config.Backend.Timeout == 0 {
		config.Backend.Timeout = 10
	}

	applyKeybindingDefaults(&config)

	return &config, nil
}

func applyKeybindingDefaults(cfg *Config) {
	kb := &cfg.Keybindings
	if len(kb.Up) == 0 {
		kb.Up = []string{"up", "k"}
	}
	if len(kb.Down) == 0 {
		kb.Down = []string{"down", "j"}
	}
	if len(kb.Left) == 0 {
		kb.Left = []string{"left", "h"}
	}
	if len(kb.Right) == 0 {
		kb.Right = []string{"right", "l"}
	}
	if len(kb.MoveLeft) == 0 {
		kb.MoveLeft = []string{"H"}
	}
	if len(kb.MoveRight) == 0 {
		kb.MoveRight = []string{"L"}
	}
	if len(kb.Add) == 0 {
		kb.Add = []string{"a"}
	}
	if len(kb.Edit) == 0 {
		kb.Edit = []string{"e"}
	}
	if len(kb.Delete) == 0 {
		kb.Delete = []string{"d"}
	}
	if len(kb.Quit) == 0 {
		kb.Quit = []string{"q", "ctrl+c"}
	}
}

func (l *Loader) Save(config *Config) error {
	configDir := filepath.Dir(l.configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := yaml.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(l.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

func (l *Loader) createDefaultConfig() (*Config, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	dataDir := filepath.Join(homeDir, defaultDataDirName)

	if buildinfo.BackendURL == "" {
		return nil, fmt.Errorf("backend URL not set (binary must be built with -ldflags)")
	}

	config := &Config{
		Backend: BackendConfig{
			URL:     buildinfo.BackendURL,
			Timeout: 10,
		},
		Daemon: DaemonConfig{
			SocketDir:  dataDir,
			SocketName: "cadenced.sock",
		},
		TUI: TUIConfig{
			Styles: StylesConfig{
				Column: ColumnStyle{
					PaddingVertical: 1, PaddingHorizontal: 2,
					BorderStyle: "rounded", BorderColor: "240",
				},
				FocusedColumn: ColumnStyle{
					PaddingVertical: 1, PaddingHorizontal: 2,
					BorderStyle: "rounded", BorderColor: "62",
				},
				ColumnTitle: TextStyle{Foreground: "99", Bold: true, Align: "center"},
				Task:         TextStyle{Foreground: "252", PaddingHorizontal: 1},
				SelectedTask: TextStyle{Foreground: "230", Background: "62", Bold: true, PaddingHorizontal: 1},
				Help:         TextStyle{Foreground: "241", PaddingVertical: 1, PaddingHorizontal: 2},
				TaskCard:         TaskCardStyle{BorderColor: "#444444"},
				SelectedTaskCard: TaskCardStyle{BorderColor: "#A8DADC"},
				Description: TextStyle{Foreground: "#888888", Italic: true, PaddingHorizontal: 2},
				Tag:         TextStyle{Foreground: "#A8DADC", PaddingHorizontal: 2},
				DueDate:     TextStyle{Foreground: "#999999", PaddingHorizontal: 2},
				Overdue:     TextStyle{Foreground: "#FF6B6B", Bold: true, PaddingHorizontal: 2},
				Priority:       PriorityColors{High: "#FF6B6B", Medium: "#FFE66D", Low: "#95E1D3", Default: "#999999"},
				DueDateUrgency: DueDateColors{Overdue: "#FF6B6B", DueSoon: "#FFE66D", Upcoming: "#A8DADC", FarFuture: "#999999"},
				ScrollIndicator: TextStyle{Foreground: "#999999", Bold: true},
			},
		},
		Keybindings: KeybindingsConfig{
			Up: []string{"up", "k"}, Down: []string{"down", "j"},
			Left: []string{"left", "h"}, Right: []string{"right", "l"},
			MoveLeft: []string{"H"}, MoveRight: []string{"L"}, Add: []string{"a"},
			Edit: []string{"e"}, Delete: []string{"d"},
			Quit: []string{"q", "ctrl+c"},
		},
		SessionTracking: SessionTrackingConfig{
			Enabled: true, PollInterval: 5, TrackerType: "tmux",
			GeneralBoardName: "General Tasks",
			GitSync: GitSyncConfig{Enabled: true, AutoSyncBranches: true, WatchForChanges: true},
		},
		TimeTracking: TimeTrackingConfig{
			Enabled: true, AutoTrack: true, IdleThreshold: 300,
			Sources: TimeTrackingSourcesConfig{Manual: true, Git: true, Tmux: true},
			Git:     TimeTrackingGitConfig{WatchBranches: true, BranchPattern: `^(feature|bugfix)/([A-Z]+-[0-9]+)`},
			Tmux:    TimeTrackingTmuxConfig{TrackActiveOnly: true},
		},
	}

	if err := l.Save(config); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	return config, nil
}

func (l *Loader) GetConfigPath() string {
	return l.configPath
}
