import { TaskPriority } from 'shared-types';

export interface PriorityOption {
  value: TaskPriority;
  label: string;
  color: string;
}

export type MetaPickerType = 'priority' | 'issueType' | null;
