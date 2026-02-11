# Shared Domain Models

> Common domain entities and business logic for Cadence applications

This package provides shared domain models, types, and business logic that are used across multiple Cadence applications (backend, TUI, mobile). It serves as a common domain layer ensuring consistency in business rules and entity definitions.

## Purpose

- **Domain Consistency** - Shared domain entities across applications
- **Business Logic** - Reusable business rules and validations
- **Type Definitions** - Common domain types and interfaces
- **Framework Agnostic** - Pure TypeScript/JavaScript without framework dependencies

## Contents

### Domain Entities

#### Project

Core project entity with properties:

```typescript
export interface ProjectProps {
  id?: ProjectId;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  created_at?: Date;
  updated_at?: Date;
  file_path?: string | null;
}

export type ProjectId = string;
export type ProjectStatus = "active" | "archived" | "completed";
```

**Usage:**
- Represents a project container for boards and tasks
- Can be in one of three states: active, archived, or completed
- Supports file-based storage with optional file path
- Includes metadata like creation and update timestamps

## Usage

### Installation

This package is part of the Cadence monorepo workspace:

```json
{
  "dependencies": {
    "@cadence/shared": "workspace:*"
  }
}
```

### Importing Domain Models

```typescript
// Import project domain model
import { ProjectProps, ProjectId, ProjectStatus } from '@cadence/shared';

// Use in your application
const project: ProjectProps = {
  name: 'My Project',
  slug: 'my-project',
  description: 'A sample project',
  status: 'active',
  color: '#7c3aed',
  created_at: new Date(),
};
```

### Backend Usage

```typescript
// In NestJS service
import { ProjectProps, ProjectStatus } from '@cadence/shared';

export class ProjectEntity implements ProjectProps {
  id: string;
  name: string;
  status: ProjectStatus;
  // ... implement interface
}
```

### TUI Usage

```typescript
// In Go TUI (via TypeScript types exported to JSON schema)
import type { ProjectProps } from '@cadence/shared';

// Use for API communication
interface ApiResponse {
  project: ProjectProps;
}
```

### Mobile Usage

```typescript
// In React Native app
import { ProjectProps, ProjectStatus } from '@cadence/shared';

const [project, setProject] = useState<ProjectProps>({
  name: '',
  status: 'active',
});
```

## Development

### Adding New Domain Models

1. Create a new file in `src/domain/`
2. Define the entity interface and types
3. Export from `src/domain/index.ts`
4. Export from `src/index.ts`

Example:

```typescript
// src/domain/Board.ts
export type BoardId = string;

export interface BoardProps {
  id?: BoardId;
  projectId: string;
  name: string;
  description?: string;
  created_at?: Date;
}

// src/domain/index.ts
export * from './Project';
export * from './Board';

// src/index.ts
export * from './domain';
```

### Guidelines

- **Keep it pure** - No framework dependencies
- **No persistence logic** - Domain models should not know about databases or files
- **No UI logic** - Keep UI concerns separate
- **Validation** - Include domain validation rules when appropriate
- **Immutability** - Prefer immutable operations
- **Documentation** - Add JSDoc comments for complex properties

## Structure

```
apps/shared/
├── src/
│   ├── domain/           # Domain entities
│   │   ├── Project.ts   # Project entity
│   │   └── index.ts     # Domain exports
│   └── index.ts         # Main export file
├── package.json
└── README.md
```

## Domain Model Principles

### Single Responsibility
Each entity represents a single business concept with clear boundaries.

### Encapsulation
Domain logic is encapsulated within entity definitions, not scattered across services.

### Framework Independence
Domain models don't depend on specific frameworks (NestJS, React, etc.).

### Testability
Pure domain models are easily testable without mocking frameworks.

## Example: Project Lifecycle

```typescript
import { ProjectProps, ProjectStatus } from '@cadence/shared';

// Create a new project
const project: ProjectProps = {
  name: 'New Feature',
  slug: 'new-feature',
  status: 'active',
  created_at: new Date(),
};

// Archive project
const archivedProject: ProjectProps = {
  ...project,
  status: 'archived',
  updated_at: new Date(),
};

// Complete project
const completedProject: ProjectProps = {
  ...project,
  status: 'completed',
  updated_at: new Date(),
};
```

## Best Practices

1. **Immutable Updates** - Use spread operator for updates, don't mutate
2. **Type Safety** - Leverage TypeScript for type checking
3. **Validation** - Implement domain validation rules
4. **Documentation** - Document business rules in comments
5. **Consistency** - Maintain consistent naming and structure

## Integration with Other Packages

### With `shared-types`
- `@cadence/shared` - Domain entities (business logic layer)
- `shared-types` - DTOs (data transfer layer)

Domain entities may be converted to DTOs for API communication:

```typescript
import { ProjectProps } from '@cadence/shared';
import { ProjectDto } from 'shared-types';

function toDto(props: ProjectProps): ProjectDto {
  return {
    id: props.id!,
    name: props.name,
    slug: props.slug!,
    description: props.description,
    color: props.color,
    status: props.status || 'active',
    createdAt: props.created_at!.toISOString(),
    updatedAt: props.updated_at?.toISOString(),
  };
}
```

## Future Entities

Planned domain models to be added:

- `Board` - Kanban board entity
- `Task` - Task entity with business rules
- `Column` - Board column entity
- `Note` - Note entity
- `Routine` - Routine entity
- `Goal` - Goal entity

## Contributing

When adding new domain models:

1. Follow existing patterns and naming conventions
2. Add comprehensive type definitions
3. Include JSDoc documentation
4. Update this README with new entities
5. Ensure backward compatibility

## License

[Your License Here]
