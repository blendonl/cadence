import { EntityTimestamps } from '../../types/common.types';
import { TaskDto } from '../tasks/task.dto';

/**
 * Board DTO
 */
export interface BoardDto extends EntityTimestamps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  projectId: string;
  filePath: string | null;
}

/**
 * Column with tasks for board detail
 */
export interface BoardColumnDto {
  id: string;
  name: string;
  position: number;
  color: string;
  wipLimit: number | null;
  tasks: TaskDto[];
  taskCount: number;
}

/**
 * Board with columns and tasks (GET /boards/:id)
 */
export interface BoardDetailDto extends BoardDto {
  columns: BoardColumnDto[];
  projectName: string;
}

/**
 * Create board request
 */
export interface BoardCreateRequestDto {
  name: string;
  description?: string;
  color?: string;
  projectId: string;
}

/**
 * Update board request
 */
export interface BoardUpdateRequestDto {
  name?: string;
  description?: string;
  color?: string;
}

/**
 * Board list response (GET /boards)
 */
export interface BoardListResponseDto {
  items: BoardDto[];
  total: number;
  page: number;
  limit: number;
}
