# Unified Daemon Architecture Implementation

## Summary
Successfully implemented the unified daemon architecture plan, consolidating 5 daemon-like components into a single event-driven system.

## Changes Made

### Created Files
1. **src/infrastructure/daemon/tasks/base/EventDrivenDaemonTask.ts**
   - Abstract base class for event-driven daemon tasks
   - Implements IDaemonTask interface
   - No polling logic (events drive behavior)
   - Provides lifecycle management (start/stop)

2. **src/infrastructure/daemon/tasks/WebSocketTask.ts**
   - Extends EventDrivenDaemonTask
   - Manages WebSocket connection for real-time updates
   - Subscribes to backend 'change' events
   - Filters changes by configured entity types
   - Publishes to EventBus: 'file_changed' and 'entity_changed' events

### Modified Files
1. **src/core/di/container.ts**
   - Updated imports: Added WebSocketTask, WebSocketClient, API_BASE_URL
   - Removed: UnfinishedTasksService imports and registration
   - Updated DAEMON_RUNNER registration to use WebSocketTask
   - Removed separate UnfinishedTasksService.start() call

2. **src/infrastructure/daemon/tasks/index.ts**
   - Exports EventDrivenDaemonTask and WebSocketTask
   - Removed EntityChangeWatcherTask export

3. **src/core/di/tokens.ts**
   - Removed UNFINISHED_TASKS_SERVICE token

4. **src/core/di/hooks.ts**
   - Removed useUnfinishedTasksService() hook
   - Removed getUnfinishedTasksService() function
   - Removed UNFINISHED_TASKS_SERVICE import

5. **src/features/agenda/index.ts**
   - Removed UnfinishedTasksService export

6. **src/infrastructure/daemon/index.ts**
   - Removed BackendChangeDetector export

### Deleted Files
1. src/infrastructure/daemon/BackendChangeDetector.ts
2. src/infrastructure/daemon/interfaces/IChangeDetector.ts
3. src/infrastructure/daemon/tasks/EntityChangeWatcherTask.ts
4. src/features/agenda/services/UnfinishedTasksService.ts

## Architecture

### Before
```
DaemonRunner
├── EntityChangeWatcherTask
│   └── BackendChangeDetector
│       └── WebSocketClient
└── UnfinishedTasksService (separate, independent polling)
```

### After
```
DaemonRunner
└── WebSocketTask
    └── WebSocketClient (direct connection)
```

## Key Features

1. **Single unified system**: All background tasks managed by DaemonRunner
2. **Event-driven**: Mobile app reacts to backend WebSocket events only
3. **Backend owns business logic**: Agenda expiry logic moved to backend
4. **Reduced complexity**: Removed unnecessary abstraction layers
5. **App state aware**: Tasks respect foreground/background transitions

## Configuration

WebSocketTask is configured with:
- **WebSocket URL**: `${API_BASE_URL}/ws/changes`
- **Entity types**: `['agenda']` (currently monitoring agenda items)
- **Auto-reconnect**: Enabled
- **Lifecycle**: Managed by DaemonRunner (start/stop/pause/resume)

## Backend Implementation

✅ **COMPLETED** - See `/mnt/data/personal/mprojectmanager/BACKEND_DAEMON_IMPLEMENTATION.md` for details.

The backend implements:
1. **WebSocket endpoint**: `/ws/changes` (via ChangesGateway)
2. **Background job**: AgendaExpiryScheduler runs every 5 minutes
   - Query items where `startAt + duration < now()`
   - Mark as unfinished if not already completed
   - Broadcast WebSocket event:
     ```json
     {
       "entityType": "agenda",
       "changeType": "modified",
       "entityId": "<item_id>",
       "timestamp": "<ISO-8601>",
       "metadata": {
         "isUnfinished": true,
         "unfinishedAt": "<ISO-8601>"
       }
     }
     ```

## Verification Steps

### Backend Setup
1. Implement backend job scheduler for marking unfinished items
2. Verify backend broadcasts WebSocket events when items marked unfinished

### Mobile App
1. Build and run the mobile app
2. Check startup logs for:
   - `[DaemonRunner] Registered task: WebSocketTask`
   - `[DaemonRunner] Starting...`
   - `[WebSocketTask] Started`
   - `[WebSocketClient] Connected`

3. Monitor WebSocket connection:
   - Create/update agenda item in backend
   - Verify WebSocketTask receives change
   - Check EventBus publishes events
   - Confirm UI updates

4. Test expired items flow:
   - Create agenda item with past scheduled time
   - Backend job marks it unfinished
   - Mobile receives WebSocket event
   - UI shows unfinished status

5. Test app state transitions:
   - Background app - verify WebSocket pauses
   - Foreground app - verify WebSocket reconnects

6. Verify clean logs:
   - No references to UnfinishedTasksService
   - No references to BackendChangeDetector
   - No references to EntityChangeWatcherTask

## Benefits

1. **Simplified mobile app**: No polling, no business logic duplication
2. **Consistent across clients**: All clients receive same updates
3. **Better performance**: Event-driven vs polling
4. **Unified lifecycle**: Single point of control for background tasks
5. **Easier maintenance**: Single WebSocket connection to manage
