import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlarmPlan } from '@prisma/client';
import { AlarmPlanUpdateData } from '../data/alarm-plan.update.data';
import {
  ALARM_PLAN_REPOSITORY,
  type AlarmPlanRepository,
} from '../repository/alarm-plan.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AlarmPlanUpdateUseCase {
  constructor(
    @Inject(ALARM_PLAN_REPOSITORY)
    private readonly alarmPlanRepository: AlarmPlanRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string, data: AlarmPlanUpdateData): Promise<AlarmPlan> {
    const plan = await this.alarmPlanRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Alarm plan not found');
    }

    const routineTask = await this.prisma.routineTask.findUnique({
      where: { id: plan.routineTaskId },
      select: { routine: { select: { userId: true } } },
    });
    if (!routineTask || routineTask.routine.userId !== userId) {
      throw new NotFoundException('Alarm plan not found');
    }

    return this.alarmPlanRepository.update(id, data);
  }
}
