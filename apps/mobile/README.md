# Cadence Mobile

> Comprehensive personal productivity and project management app for iOS and Android

Cadence Mobile is a full-featured React Native application for managing kanban boards, agendas, notes, routines, goals, and time tracking. It provides a seamless mobile experience with real-time synchronization, offline support, and cloud sync capabilities.

## Features

### Kanban Boards
- **Multiple Projects** - Organize work across different projects
- **Customizable Boards** - Create boards with custom columns
- **Task Management** - Full CRUD operations with drag-and-drop (coming soon)
- **Issue Types** - Task, Story, Bug, Epic, Subtask with visual indicators
- **Priorities** - Low, Medium, High, Urgent with color coding
- **Parent Grouping** - Hierarchical organization with color-coded parents
- **Task Details** - Rich descriptions, tags, due dates, and metadata
- **Activity Logs** - Track task history and changes
- **Subtasks** - Break down tasks into manageable pieces

### Agenda & Calendar
- **Multiple Views** - Day, week, and month calendar views
- **Timeline** - Visual timeline with time blocks
- **Task Scheduling** - Schedule tasks with dates, times, and duration
- **Meeting Support** - Add location, attendees, and meeting details
- **Recurring Tasks** - Support for recurrence rules
- **All-day Events** - Manage all-day tasks and events
- **Current Time Indicator** - Real-time timeline visualization
- **Quick Task Creation** - Create tasks directly from timeline

### Notes
- **Markdown Support** - Full markdown editing and preview
- **Note Types** - General, Meeting, Daily, Task notes
- **Entity Linking** - Link notes to projects, boards, or tasks
- **Tags** - Organize notes with tags
- **Search & Filter** - Find notes quickly
- **Rich Editor** - Edit notes with formatting

### Routines
- **Daily Routines** - Manage recurring daily routines
- **Sleep Tracking** - Configure sleep windows
- **Step Goals** - Set and track step targets
- **Repeat Intervals** - Configure routine frequency
- **Weekday Selection** - Set which days routines repeat
- **Routine Tasks** - Break routines into tasks
- **Status Management** - Active/disabled routine control

### Goals
- **Goal Tracking** - Set and manage personal and project goals
- **Goal Details** - Titles, descriptions, and progress tracking
- **Goal Management** - Create, edit, and delete goals

### Time Tracking
- **Time Overview** - View time spent on projects and tasks
- **Time Metrics** - Comprehensive time tracking analytics

### Advanced Features
- **Real-time Sync** - WebSocket-based live updates
- **OAuth Authentication** - Secure Google OAuth sign-in
- **Backend Integration** - REST API communication
- **Offline Support** - Work without internet connection
- **Cloud Sync** - Compatible with iCloud, Dropbox, Google Drive
- **Markdown Storage** - Local-first with markdown files
- **Pull-to-Refresh** - Easy data refresh
- **Haptic Feedback** - Tactile responses
- **Virtualized Lists** - Handle thousands of items smoothly

## Technology Stack

- **Framework:** React Native 0.81.5 with Expo 54.0.31
- **Language:** TypeScript 5.9.3
- **UI:** React 19.1.0
- **Navigation:** Expo Router 6.0.22 + React Navigation 7.x
- **State Management:** React Context API
- **Backend API:** HTTP client with authentication
- **Real-time:** Socket.io 4.8.3
- **Authentication:** Better-auth 1.4.18
- **Storage:** expo-file-system, AsyncStorage, SecureStore
- **Markdown:** gray-matter, js-yaml
- **Calendar:** Google Calendar integration
- **DI:** tsyringe 4.10.0
- **Notifications:** expo-notifications
- **Testing:** Jest 29.7.0 + React Native Testing Library

## Architecture

Cadence Mobile follows Clean Architecture principles:

```
apps/mobile/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── agenda/        # Agenda tab
│   │   ├── projects/      # Projects tab
│   │   ├── routines/      # Routines tab
│   │   ├── notes/         # Notes tab
│   │   └── profile/       # Profile tab
│   ├── boards/[boardId]   # Board detail screen
│   ├── tasks/[taskId]     # Task detail screen
│   └── sign-in            # Authentication screen
│
├── src/
│   ├── core/              # Core setup and configuration
│   │   ├── auth/         # Authentication (Better-auth)
│   │   ├── di/           # Dependency injection
│   │   ├── types.ts      # Core types
│   │   └── constants.ts  # Constants
│   │
│   ├── domain/            # Business entities
│   │   ├── entities/     # ActionExecutor, CalendarEvent, Parent
│   │   ├── repositories/ # Repository interfaces
│   │   └── errors/       # Domain errors
│   │
│   ├── features/          # Feature modules
│   │   ├── agenda/       # Agenda/calendar feature
│   │   │   ├── api/     # API calls
│   │   │   ├── components/ # UI components
│   │   │   ├── hooks/   # Custom hooks
│   │   │   ├── services/ # Business logic
│   │   │   └── types/   # Feature types
│   │   ├── boards/       # Board management
│   │   ├── tasks/        # Task management
│   │   ├── columns/      # Column management
│   │   ├── projects/     # Project management
│   │   ├── routines/     # Routine management
│   │   ├── notes/        # Notes feature
│   │   ├── goals/        # Goals tracking
│   │   └── time/         # Time tracking
│   │
│   ├── infrastructure/    # External integrations
│   │   ├── api/          # API client
│   │   ├── cache/        # Caching layer
│   │   ├── calendar/     # Google Calendar
│   │   ├── storage/      # Markdown parser
│   │   ├── daemon/       # Background tasks
│   │   └── websocket/    # WebSocket client
│   │
│   ├── services/         # Cross-cutting services
│   │   ├── AlertService
│   │   ├── NotificationService
│   │   ├── CalendarSyncService
│   │   └── triggers/    # Event triggers
│   │
│   ├── shared/           # Shared UI and utilities
│   │   ├── components/  # Reusable components
│   │   ├── theme/       # Theme configuration
│   │   ├── types/       # Shared types
│   │   ├── hooks/       # Shared hooks
│   │   └── utils/       # Utilities
│   │
│   └── utils/            # Utility functions
│       ├── dateUtils.ts
│       ├── stringUtils.ts
│       └── recurrenceUtils.ts
│
└── assets/               # Images, fonts, etc.
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cadence Backend API running (see [Backend README](../backend/README.md))
- For iOS: Xcode 14+ and iOS Simulator
- For Android: Android Studio and Android emulator

### Installation

```bash
# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Running the App

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web (limited support)
npm run web
```

### Configuration

Create a `.env` file (if needed):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Usage

### Authentication

1. Launch the app
2. Tap "Sign In"
3. Authenticate with Google OAuth
4. Authorization redirects back to app

### Projects & Boards

1. Navigate to **Projects** tab
2. Tap **+** to create a new project
3. Open a project to see its boards
4. Tap a board to view the kanban view
5. Create, edit, move, and delete tasks

### Agenda

1. Navigate to **Agenda** tab
2. Switch between Day, Week, and Month views
3. Tap **+** to create scheduled tasks
4. Drag time blocks to reschedule (coming soon)
5. View timeline with current time indicator

### Notes

1. Navigate to **Notes** tab
2. Tap **+** to create a new note
3. Select note type (General, Meeting, Daily, Task)
4. Add tags for organization
5. Link notes to projects or tasks

### Routines

1. Navigate to **Routines** tab
2. Create daily routines (sleep, steps, etc.)
3. Configure repeat intervals and active days
4. View routine tasks and execution logs
5. Enable/disable routines as needed

### Time Tracking

1. Navigate to **Time** (from Profile or elsewhere)
2. View time overview and metrics
3. See time spent on projects and tasks
4. Review time logs

## Features by Tab

### 📅 Agenda Tab
- Day/week/month calendar views
- Timeline with time blocks
- Task scheduling with dates and times
- Meeting details (location, attendees)
- Recurring task support
- Quick task creation

### 📁 Projects Tab
- Project list and creation
- Project details with boards
- Board navigation
- Task kanban view with columns
- Drag-and-drop (coming soon)
- Task filtering

### 🔁 Routines Tab
- Routine list and creation
- Sleep window configuration
- Step target tracking
- Repeat interval management
- Routine task lists

### 📝 Notes Tab
- Note list with filtering
- Note creation and editing
- Markdown support
- Tag management
- Entity linking

### 👤 Profile Tab
- User profile information
- Settings and preferences
- Sign out

## Data Storage

Cadence Mobile uses a hybrid storage approach:

### Backend Storage
- Primary data source via REST API
- Real-time sync via WebSocket
- Requires internet connection

### Local Storage
- Markdown files with YAML frontmatter
- Cached data for offline access
- Secure credential storage

### Cloud Sync
- Compatible with iCloud Drive (iOS)
- Dropbox sync
- Google Drive sync
- Syncthing support

### File Format

**Board File:**
```yaml
---
id: project-id
name: Project Name
description: Description
parents:
  - id: parent-id
    name: Parent Name
    color: blue
created_at: 2026-02-11T10:00:00Z
---

# Project Name
```

**Task File:**
```yaml
---
id: CAD-123
title: Task Title
parent_id: parent-id
metadata:
  issue_type: Task
  priority: high
  scheduled_date: 2026-02-15
  scheduled_time: 10:00
created_at: 2026-02-11T10:00:00Z
---

# Task Title

Detailed description...
```

## Real-time Updates

Cadence Mobile connects to the backend via WebSocket for live updates:

- **Task Changes** - Real-time task updates across devices
- **Board Updates** - Live board synchronization
- **Agenda Changes** - Instant agenda updates
- **Automatic Reconnection** - Fallback to polling if disconnected

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Code Quality

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Format code
npm run format
```

### Building

```bash
# Build for Android
npm run build:android

# Build for iOS (requires Xcode and Apple Developer account)
# Use Expo EAS Build or Xcode directly
```

### Development Tips

- **Hot Reload:** Press `r` in terminal for reload
- **Debug Menu:** Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- **React DevTools:** Install React DevTools browser extension
- **Network Inspection:** Use Reactotron or React Native Debugger

## Architecture Patterns

### Dependency Injection
- Uses `tsyringe` for DI container
- Inject services via `@injectable()` decorator
- Use `useDependency()` hook in components

### Repository Pattern
- Abstract data access behind interfaces
- Swap implementations (API, local, mock)
- Testable business logic

### Service Layer
- Business logic separated from UI
- Reusable across features
- Independent of React

### Feature Modules
- Self-contained feature folders
- Co-locate related code (components, hooks, services, types)
- Clear boundaries between features

## Performance Optimizations

- **Virtualized Lists** - FlatList with `windowSize` optimization
- **React.memo** - Memoized list item components
- **useMemo/useCallback** - Prevent unnecessary re-renders
- **Lazy Loading** - Load boards and data on demand
- **Debounced Operations** - File watching and API calls
- **Image Optimization** - Proper image sizes and formats

## Troubleshooting

### App Won't Start

```bash
# Clear Metro bundler cache
npm start -- --reset-cache

# Clear npm cache
rm -rf node_modules package-lock.json
npm install
```

### Build Errors (iOS)

```bash
cd ios
pod install
cd ..
npm run ios
```

### Build Errors (Android)

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Authentication Issues

1. Check backend is running
2. Verify OAuth credentials in backend `.env`
3. Ensure redirect URI is configured correctly
4. Clear app data and re-authenticate

### WebSocket Connection Failed

1. Verify backend WebSocket endpoint
2. Check network connectivity
3. Review backend logs for errors

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure tests pass and no lint errors
5. Submit a pull request

### Development Guidelines

- Follow TypeScript strict mode
- Write tests for business logic
- Use dependency injection
- Follow Clean Architecture principles
- Update README for new features

## Roadmap

### Coming Soon
- [ ] Drag-and-drop task movement
- [ ] Rich markdown editor with toolbar
- [ ] Advanced search and filtering
- [ ] Dark mode support
- [ ] Custom themes

### Future Features
- [ ] Push notifications
- [ ] Home screen widgets
- [ ] Share extension
- [ ] Siri shortcuts
- [ ] Apple Watch support
- [ ] Collaboration features

## License

[Your License Here]

## Acknowledgments

- Built with [React Native](https://reactnative.dev/) and [Expo](https://expo.dev/)
- Authentication via [Better-auth](https://www.better-auth.com/)
- Real-time updates with [Socket.io](https://socket.io/)
- Icons and UI components from Expo ecosystem

## Support

For issues, questions, or feature requests:
- GitHub Issues: [Link to issues]
- Documentation: [Link to docs]

---

**Version:** 2.0.0
**Status:** Production Ready
**Last Updated:** 2026-02-11
