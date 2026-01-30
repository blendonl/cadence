import { Task } from '@prisma/client';

export interface TaskListResultData {
  items: Task[];
  total: number;
  page: number;
  limit: number;
}
