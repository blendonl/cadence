import { TaskPriority } from 'shared-types';
import theme from '@shared/theme/colors';
import { PriorityOption } from '../types';

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: TaskPriority.URGENT, label: 'Urgent', color: '#FF3B30' },
  { value: TaskPriority.HIGH, label: 'High', color: theme.status.error },
  { value: TaskPriority.MEDIUM, label: 'Medium', color: theme.status.warning },
  { value: TaskPriority.LOW, label: 'Low', color: theme.status.info },
];
