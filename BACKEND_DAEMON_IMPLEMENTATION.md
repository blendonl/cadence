# Backend Daemon Implementation

## Summary
Implemented backend support for the unified daemon architecture, including:
1. WebSocket gateway for real-time change broadcasting
2. Scheduled task to mark expired agenda items as unfinished
3. Auto-broadcasting of changes to all connected mobile clients

## Changes Made

### Installed Packages
```bash
yarn add @nestjs/schedule @types/cron
```

### Created Files

#### 1. WebSocket Gateway
**File**: `apps/backend/src/websocket/changes.gateway.ts`
- WebSocket endpoint at `/ws/changes`
- Handles client connections/disconnections
- Manages client subscriptions to entity types
- Broadcasts change events to subscribed clients
- Message format:
  ```json
  {
    "entityType": "agenda",
    "changeType": "added|modified|deleted",
    "entityId": "<item_id>",
    "timestamp": "ISO-8601",
    "metadata": {}
  }
  ```

**File**: `apps/backend/src/websocket/websocket.module.ts`
- Module for WebSocket functionality
- Exports ChangesGateway for use in other modules

#### 2. Scheduled Task
**File**: `apps/backend/src/scheduler/agenda-expiry.scheduler.ts`
- Runs every 5 minutes (`@Cron(CronExpression.EVERY_5_MINUTES)`)
- Checks for expired agenda items
- Marks them as unfinished
- Broadcasts change events via WebSocket

**File**: `apps/backend/src/scheduler/scheduler.module.ts`
- Module for scheduled tasks
- Imports ScheduleModule from @nestjs/schedule
- Registers AgendaExpiryScheduler

#### 3. Use Case
**File**: `apps/backend/src/core/agenda-item/usecase/agenda-item.mark-expired-unfinished.usecase.ts`
- Business logic to find and mark expired items
- Queries all agenda items across all agendas
- Filters for expired items:
  - Not completed (`completedAt` is null)
  - Not already marked unfinished (`isUnfinished` is false)
  - Has `startAt` and `duration`
  - End time (`startAt + duration`) < current time
- Marks as unfinished and sets `unfinishedAt` timestamp

### Modified Files

#### 1. App Module
**File**: `apps/backend/src/app.module.ts`
- Added `WebSocketModule` import
- Added `SchedulerModule` import

#### 2. Agenda Item Core Module
**File**: `apps/backend/src/core/agenda-item/agenda-item.core.module.ts`
- Added `AgendaItemMarkExpiredUnfinishedUseCase` to providers
- Exported `AgendaItemMarkExpiredUnfinishedUseCase` for use by scheduler

## Architecture

```
AppModule
├── WebSocketModule
│   └── ChangesGateway (WebSocket endpoint)
└── SchedulerModule
    └── AgendaExpiryScheduler (runs every 5 minutes)
        ├── AgendaItemMarkExpiredUnfinishedUseCase
        └── ChangesGateway (broadcasts changes)
```

## How It Works

### 1. Client Connection
```typescript
// Mobile client connects to WebSocket
ws://localhost:3000/ws/changes

// Client subscribes to entity types
client.send('subscribe', { entityTypes: ['agenda'] });
```

### 2. Scheduled Expiry Check
Every 5 minutes:
1. Scheduler runs `checkExpiredAgendaItems()`
2. Use case queries database for expired items
3. Updates items: `isUnfinished = true`, `unfinishedAt = NOW()`
4. For each updated item, broadcasts change event:
```json
{
  "entityType": "agenda",
  "changeType": "modified",
  "entityId": "<item_id>",
  "timestamp": "2026-01-23T...",
  "metadata": {
    "isUnfinished": true,
    "unfinishedAt": "2026-01-23T..."
  }
}
```

### 3. Mobile Client Receives Update
1. WebSocketTask receives 'change' event
2. Publishes to EventBus: 'file_changed' and 'entity_changed'
3. UI components listening to EventBus update automatically

## Configuration

### WebSocket CORS
Currently allows all origins (`'*'`). Update in production:
```typescript
cors: {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:8081',
}
```

### Schedule Frequency
Default: Every 5 minutes
```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
```

To change frequency, use different cron expressions:
- `CronExpression.EVERY_MINUTE`
- `CronExpression.EVERY_10_MINUTES`
- `CronExpression.EVERY_HOUR`
- Custom: `@Cron('*/2 * * * *')` (every 2 minutes)

## Testing

### 1. Start Backend
```bash
cd apps/backend
yarn start:dev
```

### 2. Verify WebSocket
Check logs for:
```
[ChangesGateway] Client connected: <socket_id>
```

### 3. Test with Mobile App
1. Start mobile app
2. Check logs for WebSocket connection
3. Create agenda item with past time
4. Wait for next 5-minute mark
5. Verify item marked unfinished in UI

### 4. Manual WebSocket Test
Use a WebSocket client (e.g., `wscat`):
```bash
npm install -g wscat
wscat -c ws://localhost:3000/ws/changes

# Subscribe to agenda events
> {"event": "subscribe", "data": {"entityTypes": ["agenda"]}}

# Listen for change events
```

## Benefits

1. **Real-time updates**: Mobile clients instantly see changes
2. **Centralized logic**: Business rules in backend, not duplicated in clients
3. **Scalable**: All clients (mobile, web, etc.) receive same updates
4. **Consistent**: Single source of truth for agenda item expiry
5. **Reliable**: Scheduled task runs even when no clients connected
6. **Efficient**: Only broadcasts to subscribed clients

## Production Considerations

1. **WebSocket scaling**: Use Redis adapter for multi-instance deployments
2. **CORS security**: Configure allowed origins
3. **Rate limiting**: Add rate limiting for WebSocket connections
4. **Monitoring**: Add metrics for WebSocket connections and scheduler runs
5. **Error handling**: Implement retry logic for failed updates
6. **Database performance**: Add indexes on `startAt`, `completedAt`, `isUnfinished`
