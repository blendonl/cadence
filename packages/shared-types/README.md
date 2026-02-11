# Shared Types

> Common TypeScript DTOs and types for Cadence backend and mobile applications

This package provides shared type definitions, data transfer objects (DTOs), and enums used across the Cadence monorepo, ensuring type consistency between the backend API and mobile app.

## Purpose

- **Type Safety** - Shared types prevent type mismatches between frontend and backend
- **Code Reuse** - Single source of truth for data structures
- **API Consistency** - Ensures API contracts match client expectations
- **Developer Experience** - Autocomplete and type checking across the stack

## Contents

### Enums

Domain-specific enumerations:

- `TaskStatus` - Task states (TODO, IN_PROGRESS, DONE, etc.)
- `TaskPriority` - Task priorities (LOW, MEDIUM, HIGH, URGENT)
- `TaskType` - Task types (TASK, SUBTASK, MEETING)
- `AgendaItemStatus` - Agenda item states (PENDING, COMPLETED, CANCELLED, UNFINISHED)

### DTOs (Data Transfer Objects)

Structured data models organized by domain:

#### Users
- `UserDto` - User account information
- `UserProfileDto` - User profile details

#### Projects
- `ProjectDto` - Project information
- `CreateProjectDto` - Project creation payload
- `UpdateProjectDto` - Project update payload

#### Boards
- `BoardDto` - Board information
- `ColumnDto` - Board column details
- `CreateBoardDto` - Board creation payload
- `UpdateBoardDto` - Board update payload

#### Tasks
- `TaskDto` - Task information with metadata
- `CreateTaskDto` - Task creation payload
- `UpdateTaskDto` - Task update payload
- `MoveTaskDto` - Task movement payload

#### Task Logs
- `TaskLogDto` - Task history and action logs
- `TaskActionType` - Action types (CREATED, MOVED, UPDATED, etc.)

#### Agenda
- `AgendaDto` - Agenda information
- `AgendaItemDto` - Scheduled agenda item
- `CreateAgendaDto` - Agenda creation payload
- `UpdateAgendaItemDto` - Agenda item update payload

#### Routines
- `RoutineDto` - Routine information
- `RoutineTaskDto` - Tasks within routines
- `CreateRoutineDto` - Routine creation payload

#### Notes
- `NoteDto` - Note information
- `CreateNoteDto` - Note creation payload
- `UpdateNoteDto` - Note update payload

#### Goals
- `GoalDto` - Goal information
- `CreateGoalDto` - Goal creation payload
- `UpdateGoalDto` - Goal update payload

#### Time Logs
- `TimeLogDto` - Time tracking log entry
- `CreateTimeLogDto` - Time log creation payload

### Common Types

Shared utility types:

- `PaginationDto` - Pagination metadata
- `PaginatedResponseDto<T>` - Generic paginated response
- `DateRange` - Date range filter
- `SortOrder` - Sort direction (ASC, DESC)

## Usage

### Installation

This package is part of the Cadence monorepo workspace. It's automatically available to other workspace packages:

```json
{
  "dependencies": {
    "shared-types": "workspace:*"
  }
}
```

### Importing Types

```typescript
// Import enums
import { TaskStatus, TaskPriority, TaskType } from 'shared-types';

// Import DTOs
import {
  TaskDto,
  CreateTaskDto,
  UpdateTaskDto,
  BoardDto,
  ProjectDto
} from 'shared-types';

// Use in your code
const task: TaskDto = {
  id: '123',
  title: 'Implement feature',
  priority: TaskPriority.HIGH,
  status: TaskStatus.IN_PROGRESS,
  type: TaskType.TASK,
  // ...
};

// API request payload
const createPayload: CreateTaskDto = {
  title: 'New task',
  description: 'Task description',
  priority: TaskPriority.MEDIUM,
  columnId: 'col-456',
};
```

### Backend Usage (NestJS)

```typescript
// In controller
import { CreateTaskDto, TaskDto } from 'shared-types';

@Post()
async createTask(@Body() dto: CreateTaskDto): Promise<TaskDto> {
  return this.taskService.create(dto);
}
```

### Mobile Usage (React Native)

```typescript
// In API client
import { TaskDto, UpdateTaskDto } from 'shared-types';

async function updateTask(
  id: string,
  updates: UpdateTaskDto
): Promise<TaskDto> {
  const response = await api.patch(`/tasks/${id}`, updates);
  return response.data as TaskDto;
}
```

## Development

### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode for development
npm run watch
```

### Adding New Types

1. Create a new file in the appropriate `dtos/` or `enums/` directory
2. Export the type/interface/enum
3. Add export to `src/index.ts`
4. Run `npm run build`

Example:

```typescript
// src/dtos/features/feature.dto.ts
export interface FeatureDto {
  id: string;
  name: string;
  enabled: boolean;
  createdAt: Date;
}

export interface CreateFeatureDto {
  name: string;
  enabled?: boolean;
}

// src/dtos/features/index.ts
export * from './feature.dto';

// src/index.ts
export * from './dtos/features';
```

### Type Guidelines

- Use **interfaces** for object shapes (DTOs)
- Use **enums** for fixed sets of values
- Use **type aliases** for unions and complex types
- Prefix DTOs with descriptive names (e.g., `CreateTaskDto`, `UpdateTaskDto`)
- Keep DTOs flat when possible
- Use optional properties (`?`) for fields that may be undefined
- Use `Date` type for timestamps (serialized as ISO strings)

## Structure

```
packages/shared-types/
├── src/
│   ├── types/              # Common utility types
│   │   ├── common.types.ts
│   │   └── pagination.types.ts
│   ├── enums/              # Enumerations
│   │   ├── task-status.enum.ts
│   │   ├── task-priority.enum.ts
│   │   ├── task-type.enum.ts
│   │   └── agenda-item-status.enum.ts
│   ├── dtos/               # Data transfer objects
│   │   ├── users/
│   │   ├── projects/
│   │   ├── boards/
│   │   ├── tasks/
│   │   ├── task-logs/
│   │   ├── agenda/
│   │   ├── routines/
│   │   ├── notes/
│   │   ├── goals/
│   │   └── time-logs/
│   └── index.ts            # Main export file
├── dist/                   # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Best Practices

1. **Don't include business logic** - Keep types pure, no methods or computed properties
2. **Match API contracts exactly** - DTOs should match backend API responses
3. **Document complex types** - Add JSDoc comments for clarity
4. **Version carefully** - Type changes affect both backend and frontend
5. **Keep it minimal** - Only include what's needed for inter-service communication

## Examples

### Task Creation Flow

```typescript
// Mobile app creates a task
const payload: CreateTaskDto = {
  title: 'Fix bug in login',
  description: 'Users unable to sign in',
  priority: TaskPriority.HIGH,
  columnId: 'col-123',
  boardId: 'board-456',
};

// Backend receives and validates
@Post('/tasks')
async createTask(@Body() dto: CreateTaskDto): Promise<TaskDto> {
  const task = await this.taskService.create(dto);
  return task; // Returns TaskDto
}

// Mobile receives response
const newTask: TaskDto = await taskApi.create(payload);
console.log(newTask.id); // Type-safe access
```

### Enumeration Usage

```typescript
// Type-safe priority comparison
if (task.priority === TaskPriority.URGENT) {
  sendNotification(task);
}

// Type-safe status checking
const isComplete = task.status === TaskStatus.DONE;

// Exhaustive switch (TypeScript validates all cases)
switch (task.type) {
  case TaskType.TASK:
    return renderTask(task);
  case TaskType.SUBTASK:
    return renderSubtask(task);
  case TaskType.MEETING:
    return renderMeeting(task);
  // TypeScript error if any case is missing
}
```

## Contributing

When adding or modifying types:

1. Ensure backward compatibility when possible
2. Update version in `package.json` for breaking changes
3. Document breaking changes in commit messages
4. Test both backend and mobile apps after changes

## License

[Your License Here]
