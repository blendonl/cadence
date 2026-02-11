# Cadence Backend API

> NestJS-based REST API with WebSocket support for real-time project management

The Cadence backend is a comprehensive project and task management API built with NestJS. It provides endpoints for managing projects, boards, tasks, agendas, routines, time tracking, goals, and notes with real-time synchronization capabilities.

## Features

- **Project Management** - Create and organize projects with boards and tasks
- **Kanban Boards** - Board and column management with drag-and-drop support
- **Task Management** - Full CRUD operations with priorities, subtasks, and metadata
- **Agenda System** - Schedule tasks with calendar integration and date-based organization
- **Routine Management** - Recurring routines with alarm plans and execution logs
- **Time Tracking** - Log time spent on tasks and projects
- **Notes System** - Create notes with entity linking and tag support
- **Goals Tracking** - Set and track personal and project goals
- **Real-time Updates** - WebSocket-based live synchronization
- **Authentication** - Better-auth with Google OAuth support
- **Scheduled Jobs** - Automated cron tasks for agenda expiry, routine scheduling, and alarms
- **API Documentation** - Auto-generated OpenAPI/Swagger docs

## Technology Stack

- **Framework:** NestJS 11.0.1
- **Language:** TypeScript 5.7.2
- **Database:** PostgreSQL 13
- **ORM:** Prisma 6.19.2
- **WebSockets:** Socket.io 4.8.3
- **Authentication:** Better-auth 1.4.18
- **Scheduling:** @nestjs/schedule
- **Validation:** class-validator & class-transformer
- **Documentation:** @nestjs/swagger
- **Testing:** Jest with ts-jest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- Yarn package manager

### Installation

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/cadence

   # Authentication
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-secret-key
   JWT_EXPIRATION=1h
   JWT_REFRESH_EXPIRATION=7d

   # CORS & OAuth
   TRUSTED_ORIGINS=http://localhost:3000,http://localhost:8081

   # Environment
   NODE_ENV=development
   PORT=3000
   ```

3. Start PostgreSQL (using Docker):
   ```bash
   docker compose up -d
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

### Running the Application

```bash
# Development with hot-reload
yarn start:dev

# Production mode
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

The API will be available at `http://localhost:3000`.

## API Documentation

Interactive API documentation is available at:
- **Swagger UI:** `http://localhost:3000/api/docs`

To regenerate the OpenAPI specification:
```bash
yarn openapi:generate
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - Sign in with credentials
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/google` - Google OAuth sign-in
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Boards
- `GET /api/boards` - List boards for a project
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Columns
- `GET /api/columns` - List columns for a board
- `POST /api/columns` - Create new column
- `GET /api/columns/:id` - Get column details
- `PUT /api/columns/:id` - Update column
- `DELETE /api/columns/:id` - Delete column

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create new task
- `POST /api/tasks/quick` - Quick task creation
- `GET /api/tasks/:id` - Get task details
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/move` - Move task between columns
- `GET /api/tasks/:id/logs` - Get task history

### Agenda
- `GET /api/agendas` - List agendas by date range
- `POST /api/agendas` - Create agenda for a date
- `GET /api/agendas/:id` - Get agenda details
- `PUT /api/agendas/:id` - Update agenda
- `DELETE /api/agendas/:id` - Delete agenda

### Agenda Items
- `GET /api/agenda-items` - List agenda items
- `POST /api/agenda-items` - Create agenda item
- `GET /api/agenda-items/:id` - Get item details
- `PATCH /api/agenda-items/:id` - Update item
- `DELETE /api/agenda-items/:id` - Delete item

### Routines
- `GET /api/routines` - List all routines
- `POST /api/routines` - Create new routine
- `GET /api/routines/:id` - Get routine details
- `PATCH /api/routines/:id` - Update routine
- `DELETE /api/routines/:id` - Delete routine

### Alarms
- `GET /api/alarms` - List alarm plans
- `POST /api/alarms` - Create alarm plan
- `GET /api/alarms/:id` - Get alarm details
- `PATCH /api/alarms/:id` - Update alarm
- `DELETE /api/alarms/:id` - Delete alarm

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get note details
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Time Logs
- `GET /api/time-logs` - List time logs
- `POST /api/time-logs` - Create time log entry
- `GET /api/time-logs/:id` - Get log details

### Goals
- `GET /api/goals` - List all goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/:id` - Get goal details
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## WebSocket API

Connect to WebSocket endpoint for real-time updates:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/ws/changes',
  transports: ['websocket', 'polling'],
});

// Subscribe to entity changes
socket.emit('subscribe', {
  entityType: 'task',
  entityId: 'task-123',
});

// Listen for changes
socket.on('entity:changed', (data) => {
  console.log('Entity changed:', data);
});

// Unsubscribe
socket.emit('unsubscribe', {
  entityType: 'task',
  entityId: 'task-123',
});
```

Supported entity types:
- `project` - Project changes
- `board` - Board changes
- `column` - Column changes
- `task` - Task changes
- `agenda` - Agenda changes
- `agenda-item` - Agenda item changes
- `routine` - Routine changes
- `note` - Note changes
- `goal` - Goal changes

## Architecture

### Directory Structure

```
apps/backend/
├── src/
│   ├── core/              # Core business logic
│   │   ├── projects/      # Project management
│   │   ├── boards/        # Board management
│   │   ├── tasks/         # Task management
│   │   ├── agenda/        # Agenda system
│   │   ├── routines/      # Routine management
│   │   ├── notes/         # Notes system
│   │   ├── goals/         # Goals tracking
│   │   └── time-logs/     # Time tracking
│   ├── rest/              # REST API controllers & DTOs
│   │   ├── controllers/   # HTTP endpoints
│   │   ├── dto/          # Data transfer objects
│   │   └── mappers/      # Domain to DTO mapping
│   ├── websocket/         # WebSocket gateway
│   ├── scheduler/         # Scheduled tasks (cron jobs)
│   ├── auth/             # Authentication module
│   ├── prisma/           # Database client & migrations
│   └── main.ts           # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── test/                 # E2E tests
└── package.json
```

### Layered Architecture

1. **REST Layer** (`src/rest/`)
   - Controllers handle HTTP requests
   - DTOs define request/response shapes
   - Mappers convert between domain models and DTOs

2. **Core Layer** (`src/core/`)
   - Business logic and use cases
   - Domain services
   - Repository interfaces

3. **WebSocket Layer** (`src/websocket/`)
   - Real-time event broadcasting
   - Client subscription management

4. **Scheduler Layer** (`src/scheduler/`)
   - Cron jobs for automated tasks
   - Agenda expiry management
   - Routine scheduling

5. **Data Layer** (`src/prisma/`)
   - Database access via Prisma ORM
   - Schema definitions and migrations

## Database Schema

Key entities in the database:

- **User** - User accounts with OAuth support
- **Project** - Top-level project container
- **Board** - Kanban boards within projects
- **Column** - Board columns (to-do, in-progress, done)
- **Task** - Individual tasks with metadata
- **TaskLog** - Task history and actions
- **Agenda** - Daily agendas
- **AgendaItem** - Scheduled items in agendas
- **Routine** - Recurring routines
- **RoutineTask** - Tasks within routines
- **AlarmPlan** - Scheduled alarms
- **Note** - User notes with entity linking
- **TimeLog** - Time tracking entries
- **Goal** - User goals

To view the full schema:
```bash
npx prisma studio
```

## Scheduled Jobs

The backend runs several scheduled tasks:

1. **Agenda Expiry Scheduler** - Cleans up old agendas
2. **Routine Alarm Scheduler** - Creates alarms for routines
3. **Routine Agenda Scheduler** - Schedules routine tasks on agendas

Configure job schedules in `src/scheduler/`.

## Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Test coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

## Development

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

### Code Generation

```bash
# Generate OpenAPI spec
yarn openapi:generate

# Format code
yarn format

# Lint code
yarn lint
```

## Deployment

### Docker

Build and run with Docker:

```bash
# Build image
docker build -t cadence-backend .

# Run container
docker run -p 3000:3000 --env-file .env cadence-backend
```

### Docker Compose

The included `compose.yml` provides PostgreSQL and the backend service:

```bash
docker compose up -d
```

### Production Build

```bash
# Build for production
yarn build

# Run production build
yarn start:prod
```

### Environment Variables for Production

Ensure these are set:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `JWT_SECRET` - Strong secret for JWT signing
- `TRUSTED_ORIGINS` - Allowed origins for CORS

## Authentication Flow

### Google OAuth

1. Client initiates OAuth flow via `/api/auth/google`
2. User authenticates with Google
3. Backend receives OAuth callback and creates/updates user
4. Session cookie is set for authenticated requests

### CLI/TUI Authentication

1. TUI starts local callback server on localhost
2. User opens browser auth URL
3. After authentication, backend redirects to localhost callback
4. TUI receives token and stores it securely

## Security

- **CORS:** Configured via `TRUSTED_ORIGINS` environment variable
- **Authentication:** Session-based with better-auth
- **Authorization:** Project-level access control
- **Validation:** All inputs validated with class-validator
- **SQL Injection:** Protected by Prisma parameterized queries

## Contributing

1. Create a feature branch
2. Make changes with proper types and validation
3. Add tests for new features
4. Run linter and tests
5. Submit a pull request

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and `DATABASE_URL` is correct:
```bash
docker compose ps
npx prisma db push
```

### Port Already in Use

Change the port in `.env`:
```env
PORT=3001
```

### Migration Failures

Reset and reapply migrations:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## License

[Your License Here]
