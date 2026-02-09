import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RoutineWithTasks } from '../domain/routine-with-tasks';
import {
  ROUTINE_REPOSITORY,
  type RoutineRepository,
} from '../repository/routine.repository';
import {
  ROUTINE_TASK_REPOSITORY,
  type RoutineTaskRepository,
} from '../repository/routine-task.repository';

@Injectable()
export class RoutineGetOneUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
  ) {}

  async execute(id: string, userId: string): Promise<RoutineWithTasks> {
    const routine = await this.routineRepository.findById(id);
    if (!routine || routine.userId !== userId) {
      throw new NotFoundException('Routine not found');
    }

    const tasks = await this.routineTaskRepository.findByRoutineId(id);
    return { routine, tasks };
  }
}
