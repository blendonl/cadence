# Cadence

> A comprehensive personal productivity and project management system with terminal UI, mobile apps, and cloud sync

Cadence is a modern, full-featured project management platform designed for developers and power users who want a seamless experience across terminal, mobile, and cloud environments. It combines Kanban boards, task management, agenda scheduling, time tracking, routines, and notes into a unified ecosystem.

## Overview

Cadence is built as a monorepo containing:

- **Backend API** - NestJS-based REST API with WebSocket support for real-time updates
- **Terminal UI (TUI)** - Go-based interactive terminal application with daemon architecture
- **Mobile App** - React Native/Expo application for iOS and Android
- **Shared Packages** - Common types and domain models across the stack

## Key Features

- **Kanban Boards** - Visual project management with customizable columns and task cards
- **Agenda/Calendar** - Day, week, and month views with timeline scheduling
- **Task Management** - Full CRUD with priorities, subtasks, types, and metadata
- **Time Tracking** - Log time spent on tasks and projects with automatic tracking
- **Routines** - Create recurring daily/weekly routines with smart scheduling
- **Notes** - Markdown-based note-taking with entity linking and tags
- **Goals** - Track personal and project goals
- **Real-time Sync** - WebSocket-based live updates across all clients
- **Cloud Sync** - Markdown file format compatible with iCloud, Dropbox, Google Drive
- **OAuth Authentication** - Secure authentication with Google OAuth support
- **Background Daemon** - Persistent service for multi-client coordination

## Architecture

```
cadence/
├── apps/
│   ├── backend/          # NestJS REST API + WebSocket server
│   ├── tui/              # Go terminal UI with daemon
│   ├── mobile/           # React Native mobile app
│   └── shared/           # Shared domain models
├── packages/
│   └── shared-types/     # TypeScript DTOs and types
└── [workspace config]
```

### Technology Stack

| Component     | Technologies                                                   |
| ------------- | -------------------------------------------------------------- |
| **Backend**   | NestJS, TypeScript, PostgreSQL, Prisma, Socket.io, Better-auth |
| **TUI**       | Go 1.24, Bubble Tea, Cobra CLI, Unix sockets                   |
| **Mobile**    | React Native, Expo, TypeScript, Socket.io, Better-auth         |
| **Database**  | PostgreSQL 13                                                  |
| **Auth**      | Better-auth with Google OAuth                                  |
| **Real-time** | Socket.io WebSockets                                           |

## Getting Started

### Prerequisites

- **Node.js** 18+ (for backend and mobile)
- **Go** 1.24+ (for TUI)
- **Yarn** 4.10.3+ (package manager)
- **PostgreSQL** 13+ (for backend)
- **Docker** (optional, for containerized Postgres)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cadence
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up the backend**

   ```bash
   cd apps/backend
   cp .env.example .env
   # Edit .env with your database credentials and OAuth keys

   # Start PostgreSQL (via Docker)
   docker compose up -d

   # Run migrations
   npx prisma migrate dev

   # Start the backend
   yarn dev
   ```

4. **Set up the TUI**

   ```bash
   cd apps/tui
   make build
   make install

   # Configure
   mkdir -p ~/.config/cadence
   cadence config init

   # Start daemon
   cadenced start

   # Launch TUI
   cadence
   ```

5. **Set up the mobile app**

   ```bash
   cd apps/mobile
   npm install

   # For iOS
   npm run ios

   # For Android
   npm run android
   ```

## Development

This monorepo uses **Turborepo** for task orchestration.

### Common Commands

```bash
# Build all apps
yarn build

# Run development servers
yarn dev

# Run tests
yarn test

# Run linters
yarn lint
```

### Working with Individual Apps

Each app can be developed independently:

```bash
# Backend
cd apps/backend
yarn dev              # Start development server
yarn test             # Run tests
yarn openapi:generate # Generate OpenAPI docs

# TUI
cd apps/tui
make build            # Build binaries
make test             # Run tests
make install          # Install system-wide

# Mobile
cd apps/mobile
npm start             # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator
npm test              # Run tests
```

## Documentation

- [Backend README](./apps/backend/README.md) - API documentation, endpoints, and architecture
- [TUI README](./apps/tui/README.md) - Terminal UI usage, commands, and configuration
- [Mobile README](./apps/mobile/README.md) - Mobile app features and setup
- [Shared Types](./packages/shared-types/README.md) - Common DTOs and types
- [Shared Domain](./apps/shared/README.md) - Shared domain models

## Project Structure

### Backend (`apps/backend`)

NestJS-based REST API providing:

- User authentication and authorization
- Project, board, column, and task management
- Agenda and calendar functionality
- Routine scheduling and alarm plans
- Time tracking and logging
- Notes with entity linking
- Goals management
- Real-time WebSocket updates
- Scheduled cron jobs

**API Documentation:** Available at `/api/docs` when running the backend

### TUI (`apps/tui`)

Go-based terminal application featuring:

- Interactive TUI with three tabs: Kanban, Notes, Agenda
- Comprehensive CLI for all operations
- Background daemon for multi-client support
- Unix socket IPC for client-daemon communication
- Session tracking with tmux integration
- Time tracking with project context
- Action automation system with triggers and executors
- Systemd service support

### Mobile (`apps/mobile`)

React Native mobile application providing:

- Full Kanban board interface with drag-and-drop
- Calendar views (day/week/month) with timeline
- Task creation, editing, and scheduling
- Routine management
- Note-taking with markdown support
- Goal tracking
- Time overview
- Real-time updates via WebSocket
- OAuth authentication
- Cloud sync via markdown files

### Packages

- **shared-types** - TypeScript DTOs, enums, and types shared between backend and mobile
- **shared** - Domain models and business logic shared across apps

## Data Storage

Cadence uses a hybrid storage approach:

- **Backend** - PostgreSQL database for structured data and multi-user support
- **TUI/Mobile** - Markdown files with YAML frontmatter for local-first storage
- **Cloud Sync** - Markdown format enables seamless sync via iCloud, Dropbox, Google Drive, Syncthing

### File Format Example

```markdown
---
id: CAD-123
title: Implement feature
parent_id: epic-456
metadata:
  issue_type: Task
  priority: high
  scheduled_date: 2026-02-15
  scheduled_time: 10:00
created_at: 2026-02-11T10:30:00Z
---

# Implement feature

Detailed description of the task...
```

## Authentication

Cadence uses **Better-auth** with support for:

- Google OAuth 2.0
- Session-based authentication
- Bearer token support
- CLI/TUI auth flow via localhost callback
- Mobile Expo auth integration
- Secure token storage

## Real-time Updates

All apps support real-time synchronization:

- **WebSocket** connections via Socket.io
- Subscribe to entity changes (projects, boards, tasks, etc.)
- Automatic reconnection with fallback to polling
- Multi-client coordination via daemon (TUI)

## Deployment

### Backend

```bash
cd apps/backend
yarn build
yarn start:prod

# Or with Docker
docker compose up -d
```

### TUI

```bash
cd apps/tui
make install

# Enable systemd service
systemctl --user enable cadenced.service
systemctl --user start cadenced.service
```

### Mobile

```bash
cd apps/mobile

# Build for Android
npm run build:android

# Build for iOS
# (requires Xcode and Apple Developer account)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Terminal UI powered by [Bubble Tea](https://github.com/charmbracelet/bubbletea)
- Mobile app built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Authentication via [Better-auth](https://www.better-auth.com/)
