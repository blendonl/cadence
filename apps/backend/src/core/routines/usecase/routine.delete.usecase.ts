import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY,
  type RoutineRepository,
} from '../repository/routine.repository';
import {
  ROUTINE_TASK_REPOSITORY,
  type RoutineTaskRepository,
} from '../repository/routine-task.repository';

@Injectable()
export class RoutineDeleteUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    @Inject(ROUTINE_TASK_REPOSITORY)
    private readonly routineTaskRepository: RoutineTaskRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const routine = await this.routineRepository.findById(id);
    if (!routine || routine.userId !== userId) {
      throw new NotFoundException('Routine not found');
    }
    await this.routineTaskRepository.deleteByRoutineId(id);
    await this.routineRepository.delete(id);
  }
}
