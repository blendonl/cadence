import { Injectable } from '@nestjs/common';
import { TaskCreateData } from '../data/task.create.data';
import { TaskUpdateData } from '../data/task.update.data';
import { TaskListQueryData } from '../data/task.list.query.data';
import { TaskCreateUseCase } from '../usecase/task.create.usecase';
import { TaskDeleteUseCase } from '../usecase/task.delete.usecase';
import { TaskGetAllUseCase } from '../usecase/task.get-all.usecase';
import { TaskGetOneUseCase } from '../usecase/task.get-one.usecase';
import { TaskUpdateUseCase } from '../usecase/task.update.usecase';
import { TaskMoveUseCase } from '../usecase/task.move.usecase';
import { TaskQuickCreateUseCase } from '../usecase/task.quick-create.usecase';
import { QuickTaskCreateData } from '../data/task.quick-create.data';

@Injectable()
export class TasksCoreService {
  constructor(
    private readonly taskCreateUseCase: TaskCreateUseCase,
    private readonly taskGetAllUseCase: TaskGetAllUseCase,
    private readonly taskGetOneUseCase: TaskGetOneUseCase,
    private readonly taskUpdateUseCase: TaskUpdateUseCase,
    private readonly taskDeleteUseCase: TaskDeleteUseCase,
    private readonly taskMoveUseCase: TaskMoveUseCase,
    private readonly taskQuickCreateUseCase: TaskQuickCreateUseCase,
  ) {}

  async createTask(data: TaskCreateData) {
    return this.taskCreateUseCase.execute(data);
  }

  async getTasks(query: TaskListQueryData) {
    return this.taskGetAllUseCase.execute(query);
  }

  async getTask(taskId: string) {
    return this.taskGetOneUseCase.execute(taskId);
  }

  async updateTask(taskId: string, data: TaskUpdateData) {
    return this.taskUpdateUseCase.execute(taskId, data);
  }

  async deleteTask(taskId: string) {
    return this.taskDeleteUseCase.execute(taskId);
  }

  async moveTask(taskId: string, targetColumnId: string) {
    return this.taskMoveUseCase.execute(taskId, targetColumnId);
  }

  async quickCreateTask(data: QuickTaskCreateData) {
    return this.taskQuickCreateUseCase.execute(data);
  }
}
