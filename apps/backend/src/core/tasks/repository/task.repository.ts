import { Task } from '@prisma/client';
import { TaskCreateData } from '../data/task.create.data';
import { TaskUpdateData } from '../data/task.update.data';
import { TaskListQueryData } from '../data/task.list.query.data';
import { TaskListResultData } from '../data/task.list.result.data';

export const TASK_REPOSITORY = 'TASK_REPOSITORY';

export interface TaskRepository {
  findAll(query: TaskListQueryData): Promise<TaskListResultData>;
  create(data: TaskCreateData): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  update(id: string, data: TaskUpdateData): Promise<Task>;
  delete(id: string): Promise<void>;
  moveToColumn(taskId: string, columnId: string): Promise<Task>;
  countByColumnId(columnId: string): Promise<number>;
}
