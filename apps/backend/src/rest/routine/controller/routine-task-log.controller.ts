import { Body, Controller, Post } from '@nestjs/common';
import { RoutinesCoreService } from 'src/core/routines/service/routines.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { RoutineTaskLogCreateRequest } from '../dto/routine-task-log.create.request';

@Controller('routine-task-logs')
export class RoutineTaskLogController {
  constructor(private readonly routinesService: RoutinesCoreService) {}

  @Post()
  async create(
    @Session() session: UserSession,
    @Body() body: RoutineTaskLogCreateRequest,
  ) {
    return this.routinesService.createRoutineTaskLog({
      routineTaskId: body.routineTaskId,
      userId: session.user.id,
      value: body.value ?? null,
    });
  }
}
