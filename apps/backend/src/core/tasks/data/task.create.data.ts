import { TaskType, TaskPriority } from '@prisma/client';

export interface TaskCreateData {
  position: number;
  title: string;
  columnId: string;
  slug?: string;
  taskNumber?: number;
  description?: string;
  parentId?: string | null;
  type?: TaskType;
  priority?: TaskPriority;
}
