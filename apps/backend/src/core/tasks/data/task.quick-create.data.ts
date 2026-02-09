import { TaskType, TaskPriority } from '@prisma/client';

export interface QuickTaskCreateData {
  title: string;
  description?: string;
  parentId?: string | null;
  type?: TaskType;
  priority?: TaskPriority;
}
