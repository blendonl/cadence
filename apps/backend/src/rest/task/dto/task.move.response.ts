import { Task } from '@prisma/client';
import { TaskPriority, TaskType } from 'shared-types';

export class TaskMoveResponse {
  id: string;
  slug: string;
  title: string;
  taskType: TaskType;
  priority: TaskPriority;
  columnId: string;
  position: number;
  updatedAt: string;

  static fromDomain(task: Task): TaskMoveResponse {
    const response = new TaskMoveResponse();
    response.id = task.id;
    response.slug = task.slug;
    response.title = task.title;
    response.taskType = task.type as TaskType;
    response.priority = task.priority as TaskPriority;
    response.columnId = task.columnId;
    response.position = task.position;
    response.updatedAt = task.updatedAt.toISOString();
    return response;
  }
}
