import { Injectable } from '@nestjs/common';
import { Routine } from '@prisma/client';
import { RoutineCreateData } from '../data/routine.create.data';
import { RoutineTaskLogCreateData } from '../data/routine-task-log.create.data';
import { RoutineUpdateData } from '../data/routine.update.data';
import { RoutineWithTasks } from '../domain/routine-with-tasks';
import { RoutineCreateUseCase } from '../usecase/routine.create.usecase';
import { RoutineDeleteUseCase } from '../usecase/routine.delete.usecase';
import { RoutineGetAllUseCase } from '../usecase/routine.get-all.usecase';
import { RoutineGetOneUseCase } from '../usecase/routine.get-one.usecase';
import { RoutineTaskLogCreateUseCase } from '../usecase/routine-task-log.create.usecase';
import { RoutineUpdateUseCase } from '../usecase/routine.update.usecase';

@Injectable()
export class RoutinesCoreService {
  constructor(
    private readonly routineCreateUseCase: RoutineCreateUseCase,
    private readonly routineGetAllUseCase: RoutineGetAllUseCase,
    private readonly routineGetOneUseCase: RoutineGetOneUseCase,
    private readonly routineUpdateUseCase: RoutineUpdateUseCase,
    private readonly routineDeleteUseCase: RoutineDeleteUseCase,
    private readonly routineTaskLogCreateUseCase: RoutineTaskLogCreateUseCase,
  ) {}

  async createRoutine(data: RoutineCreateData): Promise<RoutineWithTasks> {
    return this.routineCreateUseCase.execute(data);
  }

  async getRoutines(userId: string): Promise<RoutineWithTasks[]> {
    return this.routineGetAllUseCase.execute(userId);
  }

  async getRoutine(id: string, userId: string): Promise<RoutineWithTasks> {
    return this.routineGetOneUseCase.execute(id, userId);
  }

  async updateRoutine(id: string, userId: string, data: RoutineUpdateData): Promise<Routine> {
    return this.routineUpdateUseCase.execute(id, userId, data);
  }

  async deleteRoutine(id: string, userId: string): Promise<void> {
    await this.routineDeleteUseCase.execute(id, userId);
  }

  async createRoutineTaskLog(data: RoutineTaskLogCreateData) {
    return this.routineTaskLogCreateUseCase.execute(data);
  }
}
