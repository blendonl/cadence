import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimeLogDto } from 'shared-types';
import { TimeLogsCoreService } from 'src/core/time-logs/service/time-logs.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { TimeLogCreateRequest } from '../dto/time-log.create.request';
import { TimeLogMapper } from '../time-log.mapper';

@ApiTags('time-logs')
@Controller('time-logs')
export class TimeLogController {
  constructor(private readonly timeLogsService: TimeLogsCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create time log entry' })
  async create(
    @Session() session: UserSession,
    @Body() body: TimeLogCreateRequest,
  ): Promise<TimeLogDto> {
    const timeLog = await this.timeLogsService.logTime({
      userId: session.user.id,
      projectId: body.project_id,
      taskId: body.task_id,
      date: new Date(body.date),
      durationMinutes: body.duration_minutes,
      source: body.source,
      metadata: body.metadata,
    });
    return TimeLogMapper.toResponse(timeLog);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get overall time summary' })
  async getOverallSummary(
    @Session() session: UserSession,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const summary = await this.timeLogsService.getOverallSummary(
      session.user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return summary;
  }

  @Get('summary/:projectId')
  @ApiOperation({ summary: 'Get project time summary' })
  async getProjectSummary(
    @Session() session: UserSession,
    @Param('projectId') projectId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const summary = await this.timeLogsService.getProjectSummary(
      session.user.id,
      projectId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return summary;
  }

  @Get('daily/:date')
  @ApiOperation({ summary: 'Get daily time summary' })
  async getDailySummary(
    @Session() session: UserSession,
    @Param('date') date: string,
  ) {
    const summary = await this.timeLogsService.getDailySummary(
      session.user.id,
      new Date(date),
    );
    return summary;
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get task work time' })
  async getTaskWorkTime(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
  ): Promise<TimeLogDto[]> {
    const logs = await this.timeLogsService.getTaskWorkTime(taskId, session.user.id);
    return logs.map(TimeLogMapper.toResponse);
  }
}
