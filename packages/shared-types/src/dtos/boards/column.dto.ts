import { EntityTimestamps } from '../../types/common.types';

/**
 * Column DTO
 */
export interface ColumnDto extends EntityTimestamps {
  id: string;
  name: string;
  position: number;
  boardId: string;
  wipLimit: number | null;
}

/**
 * Create column request
 */
export interface ColumnCreateRequestDto {
  name: string;
  position?: number;
  boardId: string;
  wipLimit?: number;
}

/**
 * Update column request
 */
export interface ColumnUpdateRequestDto {
  name?: string;
  position?: number;
  wipLimit?: number;
}
