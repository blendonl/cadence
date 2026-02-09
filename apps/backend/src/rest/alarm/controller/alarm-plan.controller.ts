import { Controller, Get, NotFoundException, Param, Patch, Query, Body } from '@nestjs/common';
import { AlarmCoreService } from 'src/core/alarms/service/alarm.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { AlarmPlanMapper } from '../alarm-plan.mapper';
import { AlarmPlanResponse } from '../dto/alarm-plan.response';
import { AlarmPlanUpdateRequest } from '../dto/alarm-plan.update.request';

@Controller('alarm-plans')
export class AlarmPlanController {
  constructor(private readonly alarmService: AlarmCoreService) {}

  @Get(':id')
  async getOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<AlarmPlanResponse> {
    const plan = await this.alarmService.getPlan(id, session.user.id);
    if (!plan) {
      throw new NotFoundException('Alarm plan not found');
    }
    return AlarmPlanMapper.toResponse(plan);
  }

  @Get()
  async listByRoutineTask(
    @Session() session: UserSession,
    @Query('routineTaskId') routineTaskId?: string,
  ): Promise<AlarmPlanResponse[]> {
    if (!routineTaskId) {
      return [];
    }

    const plans = await this.alarmService.getPlansByRoutineTask(routineTaskId, session.user.id);
    return plans.map(AlarmPlanMapper.toResponse);
  }

  @Patch(':id')
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: AlarmPlanUpdateRequest,
  ): Promise<AlarmPlanResponse> {
    const updated = await this.alarmService.updatePlan(id, session.user.id, {
      status: body.status,
    });
    return AlarmPlanMapper.toResponse(updated);
  }
}
