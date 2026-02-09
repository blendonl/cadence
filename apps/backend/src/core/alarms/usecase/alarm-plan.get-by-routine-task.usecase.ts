import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AlarmPlanGetByRoutineTaskUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(routineTaskId: string, userId: string): Promise<AlarmPlan[]> {
    const routineTask = await this.prisma.routineTask.findUnique({
      where: { id: routineTaskId },
      select: { routine: { select: { userId: true } } },
    });
    if (!routineTask || routineTask.routine.userId !== userId) {
      throw new NotFoundException('Routine task not found');
    }
    return this.alarmPlanRepository.findByRoutineTaskId(routineTaskId);
  }
}
