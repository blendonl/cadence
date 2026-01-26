import { EntityTimestamps } from '../../types/common.types';

/**
 * Time log DTO
 */
export interface TimeLogDto extends EntityTimestamps {
  id: string;
  taskId: string | null;
  projectId: string | null;
  startTime: string;  // ISO timestamp
  endTime: string | null;  // ISO timestamp
  duration: number | null;  // minutes
  description: string | null;
}

/**
 * Time log with context
 */
export interface TimeLogDetailDto extends TimeLogDto {
  taskTitle: string | null;
  projectName: string | null;
}

/**
 * Time log summary by project
 */
export interface TimeLogSummaryDto {
  projectId: string;
  projectName: string;
  totalMinutes: number;
  entryCount: number;
}

/**
 * Create time log request
 */
export interface TimeLogCreateRequestDto {
  taskId?: string;
  projectId?: string;
  startTime: string;
  endTime?: string;
  description?: string;
}

/**
 * Update time log request
 */
export interface TimeLogUpdateRequestDto {
  taskId?: string;
  projectId?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}
