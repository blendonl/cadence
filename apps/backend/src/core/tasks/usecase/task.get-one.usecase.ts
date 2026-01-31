import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../domain/task';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';
import { TaskFindOneData } from '../data/task.find.one.data';

@Injectable()
export class TaskGetOneUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(taskId: string): Promise<TaskFindOneData> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }

    return task;
  }
}
