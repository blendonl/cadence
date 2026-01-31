import { TaskPriority, TaskType } from '@prisma/client';
import { Column } from 'src/core/columns/domain/column';

export interface TaskFindOneData {
  id: string;
  title: string;
  slug: string;
  taskNumber: number;
  description: string | null;
  columnId: string;
  parentId: string | null;
  type: TaskType;
  priority: TaskPriority;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  dueAt: Date | null;
  column: Column;
}
