import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AlarmPlanGetOneUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<AlarmPlan | null> {
    const plan = await this.alarmPlanRepository.findById(id);
    if (!plan) {
      return null;
    }
    await this.assertRoutineOwnership(plan.routineTaskId, userId);
    return plan;
  }

  private async assertRoutineOwnership(routineTaskId: string, userId: string): Promise<void> {
    const routineTask = await this.prisma.routineTask.findUnique({
      where: { id: routineTaskId },
      select: { routine: { select: { userId: true } } },
    });
    if (!routineTask || routineTask.routine.userId !== userId) {
      throw new NotFoundException('Alarm plan not found');
    }
  }
}
