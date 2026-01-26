/**
 * Task priority enumeration
 */

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export type TaskPriorityType = `${TaskPriority}`;
