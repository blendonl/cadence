import { Inject, Injectable } from '@nestjs/common';
import { TaskListQueryData } from '../data/task.list.query.data';
import { TaskListResultData } from '../data/task.list.result.data';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';

@Injectable()
export class TaskGetAllUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(query: TaskListQueryData): Promise<TaskListResultData> {
    const result = await this.taskRepository.findAll(query);
    return result;
  }
}
