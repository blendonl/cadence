import { EntityTimestamps } from '../../types/common.types';

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
 * Board with columns
 */
export interface BoardDetailDto extends BoardDto {
  columns: ColumnSummaryDto[];
  projectName: string;
}

/**
 * Column summary for nested responses
 */
export interface ColumnSummaryDto {
  id: string;
  name: string;
  position: number;
  taskCount: number;
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
