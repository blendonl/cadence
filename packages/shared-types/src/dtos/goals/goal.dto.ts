import { EntityTimestamps } from '../../types/common.types';

/**
 * Goal DTO
 */
export interface GoalDto extends EntityTimestamps {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived';
  targetDate: string | null;  // YYYY-MM-DD
  completedAt: string | null;
  filePath: string | null;
}

/**
 * Create goal request
 */
export interface GoalCreateRequestDto {
  title: string;
  description?: string;
  targetDate?: string;
}

/**
 * Update goal request
 */
export interface GoalUpdateRequestDto {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
  targetDate?: string;
  completedAt?: string;
}
