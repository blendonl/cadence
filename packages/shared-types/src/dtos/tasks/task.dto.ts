import { TaskStatusType } from '../../enums/task-status.enum';
import { TaskPriorityType } from '../../enums/task-priority.enum';
import { EntityTimestamps } from '../../types/common.types';

/**
 * Task DTO
 */
export interface TaskDto extends EntityTimestamps {
  id: string;
  title: string;
  description: string | null;
  taskType: 'regular' | 'meeting' | 'milestone';
  status: TaskStatusType;
  priority: TaskPriorityType | null;
  columnId: string;
  boardId: string;
  projectId: string;
  goalId: string | null;
  position: number;
  dueDate: string | null;  // YYYY-MM-DD
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  filePath: string | null;
  completedAt: string | null;
}

/**
 * Task with context (board, project names)
 */
export interface TaskDetailDto extends TaskDto {
  boardName: string;
  projectName: string;
  columnName: string;
}

/**
 * Create task request
 */
export interface TaskCreateRequestDto {
  title: string;
  description?: string;
  taskType?: 'regular' | 'meeting' | 'milestone';
  priority?: TaskPriorityType;
  columnId: string;
  goalId?: string;
  position?: number;
  dueDate?: string;
  estimatedMinutes?: number;
}

/**
 * Update task request
 */
export interface TaskUpdateRequestDto {
  title?: string;
  description?: string;
  taskType?: 'regular' | 'meeting' | 'milestone';
  status?: TaskStatusType;
  priority?: TaskPriorityType;
  columnId?: string;
  goalId?: string;
  position?: number;
  dueDate?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string;
}

/**
 * Move task request
 */
export interface TaskMoveRequestDto {
  columnId: string;
  position: number;
}
