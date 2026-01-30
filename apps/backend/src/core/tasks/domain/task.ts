import { TaskPriority, TaskType } from '@prisma/client';

export interface Task {
  id: string;
  slug: string;
  taskNumber: number;
  title: string;
  columnId: string;
  description?: string | null;
  parentId?: string | null;
  createdAt?: Date;
  type: TaskType;
  priority: TaskPriority;
}
