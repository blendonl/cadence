import { EntityTimestamps } from '../../types/common.types';

/**
 * Task Log DTO
 */
export interface TaskLogDto extends EntityTimestamps {
  id: string;
  taskId: string;
  action: string;
  value: string | null;
  metadata: Record<string, any> | null;
}

/**
 * Work duration response
 */
export interface WorkDurationDto {
  durationMinutes: number;
  formattedDuration: string;
  startedAt: string | null;
  completedAt: string | null;
}
