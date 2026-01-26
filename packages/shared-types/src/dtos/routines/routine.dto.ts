import { EntityTimestamps } from '../../types/common.types';

/**
 * Routine DTO
 */
export interface RoutineDto extends EntityTimestamps {
  id: string;
  name: string;
  description: string | null;
  routineType: 'SLEEP' | 'STEP' | 'OTHER';
  target: number | null;
  color: string;
  isActive: boolean;
}

/**
 * Routine task DTO
 */
export interface RoutineTaskDto extends EntityTimestamps {
  id: string;
  routineId: string;
  name: string;
  description: string | null;
  duration: number | null;
  position: number;
}

/**
 * Routine with tasks
 */
export interface RoutineDetailDto extends RoutineDto {
  tasks: RoutineTaskDto[];
}

/**
 * Create routine request
 */
export interface RoutineCreateRequestDto {
  name: string;
  description?: string;
  routineType: 'SLEEP' | 'STEP' | 'OTHER';
  target?: number;
  color?: string;
}

/**
 * Update routine request
 */
export interface RoutineUpdateRequestDto {
  name?: string;
  description?: string;
  routineType?: 'SLEEP' | 'STEP' | 'OTHER';
  target?: number;
  color?: string;
  isActive?: boolean;
}

/**
 * Create routine task request
 */
export interface RoutineTaskCreateRequestDto {
  routineId: string;
  name: string;
  description?: string;
  duration?: number;
  position?: number;
}

/**
 * Update routine task request
 */
export interface RoutineTaskUpdateRequestDto {
  name?: string;
  description?: string;
  duration?: number;
  position?: number;
}
