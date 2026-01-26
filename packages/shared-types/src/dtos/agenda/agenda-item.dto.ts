import { AgendaItemStatusType } from '../../enums/agenda-item-status.enum';
import { TaskPriorityType } from '../../enums/task-priority.enum';
import { EntityTimestamps } from '../../types/common.types';

/**
 * Base agenda item DTO
 */
export interface AgendaItemDto extends EntityTimestamps {
  id: string;
  agendaId: string;
  taskId: string | null;
  routineTaskId: string | null;
  startAt: string | null;  // ISO timestamp
  duration: number | null;
  status: AgendaItemStatusType;
  position: number;
  notes: string | null;
  completedAt: string | null;
  notificationId: string | null;
}

/**
 * Task information for enriched agenda items
 */
export interface TaskInfoDto {
  id: string;
  title: string;
  description: string | null;
  taskType: 'regular' | 'meeting' | 'milestone';
  priority: TaskPriorityType | null;
  columnId: string;
  boardId: string;
  projectId: string;
  boardName: string;
  projectName: string;
  columnName: string;
  goalId: string | null;
}

/**
 * Routine task information for enriched agenda items
 */
export interface RoutineTaskInfoDto {
  id: string;
  routineId: string;
  name: string;
  routineName: string;
  routineType: 'SLEEP' | 'STEP' | 'OTHER';
  routineTarget: string | null;
}

/**
 * Enriched agenda item with task or routine details
 * Backend should flatten all nested data
 */
export interface AgendaItemEnrichedDto extends AgendaItemDto {
  task: TaskInfoDto | null;
  routineTask: RoutineTaskInfoDto | null;
}

/**
 * Agenda DTO
 */
export interface AgendaDto extends EntityTimestamps {
  id: string;
  date: string;  // YYYY-MM-DD format
  notes: string | null;
}

/**
 * Enriched agenda with items
 */
export interface AgendaEnrichedDto extends AgendaDto {
  sleep: AgendaSleepDto;
  steps: AgendaItemEnrichedDto[];
  routines: AgendaItemEnrichedDto[];
  tasks: AgendaItemEnrichedDto[];
}

export interface AgendaSleepDto {
  sleep: AgendaItemEnrichedDto | null;
  wakeup: AgendaItemEnrichedDto | null;
}

/**
 * Create agenda item request
 */
export interface AgendaItemCreateRequestDto {
  agendaId: string;
  taskId?: string;
  routineTaskId?: string;
  startAt?: string;
  duration?: number;
  position?: number;
  notes?: string;
}

/**
 * Update agenda item request
 */
export interface AgendaItemUpdateRequestDto {
  startAt?: string;
  duration?: number;
  status?: AgendaItemStatusType;
  position?: number;
  notes?: string;
  completedAt?: string;
}
