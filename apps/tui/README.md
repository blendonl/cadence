# Cadence TUI

> A modern terminal-based project management system with interactive UI, comprehensive CLI, and backend integration

Cadence TUI is a powerful terminal application for managing kanban boards, notes, agendas, and time tracking. It features both an interactive TUI with three tab-based views and a comprehensive CLI for automation and scripting. Built with a daemon architecture for multi-client support and real-time synchronization with the backend API.

## Features

### Interactive TUI
- **Multi-Tab Interface** - Three specialized views:
  - **Kanban** - Visual board with columns and task cards
  - **Notes** - Markdown-based note management
  - **Agenda** - Calendar and schedule view with time tracking
- **Real-time Updates** - Live synchronization across all connected clients
- **Keyboard-Driven** - Vim-inspired navigation and customizable keybindings
- **Daemon Architecture** - Background service for multi-client coordination

### Comprehensive CLI
- **Full CRUD Operations** - Manage tasks, boards, columns, notes, agendas, projects, routines
- **Multiple Output Formats** - Text, JSON, YAML, Path, FZF for scripting
- **Batch Operations** - Automate workflows with scriptable commands
- **Shell Completion** - Bash, Zsh, Fish, PowerShell support

### Advanced Features
- **Backend Integration** - REST API communication with authentication
- **OAuth Authentication** - Secure sign-in with Google OAuth
- **Session Tracking** - Tmux-aware session management with project context
- **Time Tracking** - Automatic and manual time logging
- **Action Automation** - Time-based and event-based task automation
  - Time triggers (absolute, relative, cron)
  - Event triggers (task created, moved, completed, etc.)
  - Executors (notifications, scripts, task mutations)
- **Project Management** - Multi-project support with context switching
- **Routine Management** - Create and schedule recurring routines

## Technology Stack

- **Language:** Go 1.24
- **TUI Framework:** Bubble Tea (charmbracelet)
- **CLI Framework:** Cobra
- **IPC:** Unix sockets with JSON protocol
- **UI Components:** Bubbles, Lipgloss (charmbracelet)
- **Backend API:** HTTP client with OAuth support
- **Session Management:** Tmux integration
- **File Watching:** fsnotify
- **Configuration:** YAML

## Architecture

Cadence TUI uses a clean, layered architecture:

```
apps/tui/
├── cmd/
│   ├── cadence/            # TUI client entry point
│   │   └── commands/       # CLI command implementations
│   │       ├── task/       # Task commands
│   │       ├── board/      # Board commands
│   │       ├── column/     # Column commands
│   │       ├── note/       # Note commands
│   │       ├── agenda/     # Agenda commands
│   │       ├── project/    # Project commands
│   │       ├── time/       # Time tracking commands
│   │       └── config/     # Config commands
│   └── cadenced/           # Background daemon
│
├── internal/
│   ├── domain/             # Business entities
│   │   ├── session/        # Session management
│   │   └── timetracking/   # Time tracking
│   ├── application/        # DTOs and use cases
│   │   ├── dto/           # Data transfer objects
│   │   └── services/      # Application services
│   ├── infrastructure/     # External integrations
│   │   ├── api/           # Backend API client
│   │   ├── auth/          # OAuth authentication
│   │   ├── config/        # Configuration management
│   │   └── external/      # External services (git, tmux)
│   ├── daemon/            # IPC daemon
│   │   ├── protocol/      # Communication protocol
│   │   ├── server/        # Unix socket server
│   │   ├── session/       # Session manager
│   │   └── timetracking/  # Time tracking manager
│   └── di/                # Dependency injection
│
├── tui/                    # TUI views
│   ├── app/               # Main app with tab management
│   ├── kanban/            # Kanban board view
│   ├── notes/             # Notes view
│   ├── agenda/            # Agenda/calendar view
│   ├── common/            # Shared components
│   └── style/             # Styling
│
└── pkg/                   # Utilities
    ├── output/            # Output formatting
    └── editor/            # External editor integration
```

### Key Components

1. **AppModel** - Main coordinator managing three tab views (Kanban, Notes, Agenda)
2. **Daemon Server** - Unix socket IPC server with subscription support
3. **Session Manager** - Tmux-aware session tracking for project context
4. **Time Tracking Manager** - Automatic activity and time logging
5. **Backend Client** - REST API communication with authentication
6. **Action System** - Event-driven automation with triggers and executors

## Getting Started

### Prerequisites

- Go 1.24 or later
- Cadence Backend API running (see [Backend README](../backend/README.md))
- Git (optional, for git workflow features)
- Tmux (optional, for session tracking)
- Make (optional, for using Makefile)

### Installation

#### Quick Build

```bash
# Build both TUI and daemon
make build

# Or manually
go build -o cadence ./cmd/cadence
go build -o cadenced ./cmd/cadenced
```

#### Install System-Wide

```bash
# Install to /usr/local/bin (requires sudo)
sudo make install

# Or install to custom prefix
PREFIX=$HOME/.local make install
```

#### Arch Linux

```bash
# Using the PKGBUILD
makepkg -sfi

# Or via AUR (when published)
yay -S cadence-tui
```

#### Using Install Script

```bash
# System-wide installation
sudo ./install.sh

# User installation
PREFIX=$HOME/.local ./install.sh
```

### Configuration

Initialize configuration file:

```bash
# Create config file
mkdir -p ~/.config/cadence
cadence config init
```

Edit `~/.config/cadence/config.yml`:

```yaml
# Backend API
api:
  base_url: http://localhost:3000
  timeout: 30s

# Daemon settings
daemon:
  socket_path: /tmp/cadenced-${USER}.sock
  auto_start: true

# Session tracking
session:
  enabled: true
  track_tmux: true
  auto_switch_project: true

# Time tracking
time_tracking:
  enabled: true
  auto_track: true
  idle_threshold: 5m

# Keybindings
keybindings:
  quit: q
  up: k
  down: j
  left: h
  right: l
  new_task: n
  delete: d
  edit: e
  move: m

# Styles
styles:
  primary_color: "#7c3aed"
  secondary_color: "#06b6d4"
  accent_color: "#f59e0b"
```

### Authentication

Sign in to the backend:

```bash
# Launch authentication flow
cadence auth login

# This will:
# 1. Open your browser for OAuth
# 2. Redirect back to local callback
# 3. Store auth token securely
```

### Running

#### Interactive TUI

```bash
# Launch TUI (starts daemon automatically)
cadence

# Launch with specific project
cadence --project-id my-project

# Launch with specific board
cadence --board-id board-123
```

#### Start Daemon Manually

```bash
# Start daemon in foreground
cadenced

# Start daemon in background
cadenced --daemon

# Check daemon status
cadenced status

# Stop daemon
cadenced stop
```

#### Enable Systemd Service

```bash
# Install user service
mkdir -p ~/.config/systemd/user
cp systemd/cadenced.service ~/.config/systemd/user/

# Enable and start
systemctl --user daemon-reload
systemctl --user enable --now cadenced.service

# Check status
systemctl --user status cadenced.service
```

## Interactive TUI

### Three-Tab Interface

The TUI provides three specialized views accessible via tab navigation:

#### 1. Kanban Tab

Visual board with columns and tasks:
- Navigate between columns and tasks
- Create, edit, move, and delete tasks
- View task priorities, due dates, and tags
- Real-time updates from other clients

#### 2. Notes Tab

Markdown note management:
- Create and edit notes
- Filter by tags and types
- Link notes to tasks and projects
- Full markdown support

#### 3. Agenda Tab

Calendar and schedule view:
- Day, week, and month views
- Timeline visualization
- Schedule tasks with dates and times
- View upcoming deadlines

### Keybindings

#### Global
- `Tab` / `Shift+Tab` - Switch between tabs
- `q` / `Ctrl+C` - Quit
- `?` - Show help

#### Kanban View
- `h/←` - Move left (previous column)
- `l/→` - Move right (next column)
- `k/↑` - Move up (previous task)
- `j/↓` - Move down (next task)
- `n` - Create new task
- `e` - Edit selected task
- `d` - Delete selected task
- `m` - Move task to next column
- `Enter` - View task details
- `/` - Search tasks
- `f` - Filter tasks

#### Notes View
- `k/↑` - Previous note
- `j/↓` - Next note
- `n` - Create new note
- `e` - Edit selected note
- `d` - Delete selected note
- `Enter` - View note details
- `/` - Search notes
- `f` - Filter notes

#### Agenda View
- `h/←` - Previous day/week/month
- `l/→` - Next day/week/month
- `k/↑` - Previous item
- `j/↓` - Next item
- `n` - Create agenda item
- `e` - Edit selected item
- `d` - Delete selected item
- `v` - Switch view mode (day/week/month)
- `t` - Go to today

Keybindings are customizable in the config file.

## CLI Reference

### Project Commands

```bash
# List all projects
cadence project list

# Get project details
cadence project get <project-id>

# Create project
cadence project create --name "My Project" --description "Project description"

# Switch active project
cadence project switch <project-id>
```

### Board Commands

```bash
# List boards
cadence board list

# Get board details
cadence board get <board-id>

# Create board
cadence board create --name "Development" --project-id my-project

# Switch active board
cadence board switch <board-id>
```

### Column Commands

```bash
# List columns
cadence column list

# Create column
cadence column create --name "In Progress" --position 2

# Update column
cadence column update <column-id> --name "Done" --wip-limit 5

# Delete column
cadence column delete <column-id>
```

### Task Commands

```bash
# List tasks
cadence task list
cadence task list --column "In Progress"
cadence task list --priority high
cadence task list --output json

# Get task details
cadence task get <task-id>

# Create task
cadence task create \
  --title "Implement feature" \
  --description "Add new feature" \
  --priority high \
  --column "Todo"

# Update task
cadence task update <task-id> \
  --title "New title" \
  --priority critical

# Move task
cadence task move <task-id> <column-id>

# Delete task
cadence task delete <task-id>
```

### Note Commands

```bash
# List notes
cadence note list

# Get note
cadence note get <note-id>

# Create note
cadence note create --title "Meeting notes" --content "..."

# Update note
cadence note update <note-id> --content "Updated content"

# Delete note
cadence note delete <note-id>
```

### Agenda Commands

```bash
# List agenda items
cadence agenda list --date 2026-02-15

# Get agenda
cadence agenda get <agenda-id>

# Create agenda item
cadence agenda create \
  --title "Team meeting" \
  --date 2026-02-15 \
  --time 10:00 \
  --duration 60

# Update agenda item
cadence agenda update <item-id> --status completed

# Delete agenda item
cadence agenda delete <item-id>
```

### Time Tracking Commands

```bash
# Show time overview
cadence time overview

# List time logs
cadence time list --date 2026-02-15

# Start timer
cadence time start --task-id <task-id>

# Stop timer
cadence time stop

# Log time manually
cadence time log --task-id <task-id> --duration 2h
```

### Config Commands

```bash
# Show configuration
cadence config show

# Edit configuration
cadence config edit

# Show config path
cadence config path

# Initialize config
cadence config init
```

### Global Flags

Available for all commands:

```bash
--project-id, -p <id>   Project to operate on
--board-id, -b <id>     Board to operate on
--output, -o <format>   Output format: text, json, yaml, path, fzf
--config, -c <path>     Config file path
--quiet, -q             Suppress output
--help, -h              Show help
```

## Output Formats

### Text (Default)

Human-readable table output:
```
TODO
  TASK-001 Fix login bug        due tomorrow
  TASK-002 Update documentation

IN PROGRESS
  TASK-003 Implement API        overdue 2 days
```

### JSON

For scripting and automation:
```bash
cadence task list --output json | jq '.[] | select(.priority == "high")'
```

### YAML

For configuration and readability:
```bash
cadence board get my-board --output yaml > board-backup.yml
```

### Path

For integration with other tools:
```bash
cadence task list --output path
# Output: projects/my-project/boards/board-123/tasks/TASK-001
```

### FZF

For interactive selection:
```bash
cadence task list --output fzf | fzf | xargs -I {} cadence task get {}
```

## Action Automation

Cadence supports powerful automation via actions in the config file:

```yaml
actions:
  - name: "Notify on high priority tasks"
    trigger:
      type: event
      event: task_created
      conditions:
        - field: priority
          operator: equals
          value: high
    executors:
      - type: notify
        title: "High priority task created"
        body: "Task: {{.title}}"

  - name: "Daily standup reminder"
    trigger:
      type: time
      schedule: "0 9 * * 1-5"  # 9 AM weekdays
    executors:
      - type: script
        command: "notify-send 'Standup in 15 minutes'"

  - name: "Auto-tag overdue tasks"
    trigger:
      type: time
      schedule: "0 0 * * *"  # Daily at midnight
    executors:
      - type: task_mutation
        action: add_tag
        tag: overdue
        filter:
          due_date_before: now
```

See [ACTIONS_QUICKSTART.md](./ACTIONS_QUICKSTART.md) for more details.

## Session Tracking

Cadence automatically tracks your work sessions:

- **Tmux Integration** - Detects tmux sessions and associates them with projects
- **Auto Project Switching** - Switches active project when changing tmux sessions
- **Time Tracking** - Logs time spent on projects automatically
- **Idle Detection** - Stops tracking after configurable idle time

## Development

### Build

```bash
# Build both binaries
make build

# Build TUI only
go build -o cadence ./cmd/cadence

# Build daemon only
go build -o cadenced ./cmd/cadenced
```

### Test

```bash
# Run all tests
make test

# Run tests with coverage
make coverage

# Run specific test
go test ./internal/daemon/...
```

### Code Quality

```bash
# Format code
make fmt

# Run linters
make lint

# Generate wire DI
make wire
```

### Dependencies

```bash
# Download dependencies
go mod download

# Update dependencies
go get -u ./...

# Tidy dependencies
go mod tidy
```

## Daemon Protocol

The daemon uses Unix sockets (`/tmp/cadenced-${USER}.sock`) with JSON-based request/response protocol.

### Request Types

- `get_board` - Retrieve board state
- `list_boards` - List all boards
- `create_task` - Create new task
- `update_task` - Update task
- `move_task` - Move task between columns
- `delete_task` - Delete task
- `subscribe` - Subscribe to updates
- `get_active_project` - Get current project
- `start_timer` - Start time tracking
- `stop_timer` - Stop time tracking

### Real-time Updates

Clients can subscribe to changes via persistent connections:

```go
// Subscribe to board updates
socket.Send(Request{
    Type: "subscribe",
    Data: map[string]string{
        "entity_type": "board",
        "entity_id": "board-123",
    },
})

// Receive notifications
notification := <-socket.Notifications()
fmt.Printf("Board updated: %v\n", notification.Data)
```

## Troubleshooting

### Daemon Not Starting

Check if socket is in use:
```bash
lsof /tmp/cadenced-${USER}.sock
rm /tmp/cadenced-${USER}.sock
cadenced start
```

### Authentication Issues

Re-authenticate:
```bash
cadence auth logout
cadence auth login
```

### Backend Connection Failed

Verify backend is running:
```bash
curl http://localhost:3000/api/health
```

Check API URL in config:
```bash
cadence config show | grep base_url
```

### TUI Not Updating

Check daemon status:
```bash
systemctl --user status cadenced.service
```

Restart daemon:
```bash
systemctl --user restart cadenced.service
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `make test` and `make lint`
5. Submit a pull request

## License

[Your License Here]

## Acknowledgments

- Built with [Bubble Tea](https://github.com/charmbracelet/bubbletea)
- CLI powered by [Cobra](https://github.com/spf13/cobra)
- Styled with [Lipgloss](https://github.com/charmbracelet/lipgloss)
