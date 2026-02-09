import { Injectable } from '@nestjs/common';
import { TimeLogCreateData } from '../data/time-log.create.data';
import { TimeLogCreateUseCase } from '../usecase/time-log.create.usecase';
import { TimeLogGetDailyUseCase } from '../usecase/time-log.get-daily.usecase';
import { TimeLogGetProjectSummaryUseCase } from '../usecase/time-log.get-project-summary.usecase';
import { TimeLogGetTaskTimeUseCase } from '../usecase/time-log.get-task-time.usecase';

@Injectable()
export class TimeLogsCoreService {
  constructor(
    private readonly timeLogCreateUseCase: TimeLogCreateUseCase,
    private readonly timeLogGetProjectSummaryUseCase: TimeLogGetProjectSummaryUseCase,
    private readonly timeLogGetDailyUseCase: TimeLogGetDailyUseCase,
    private readonly timeLogGetTaskTimeUseCase: TimeLogGetTaskTimeUseCase,
  ) {}

  async logTime(data: TimeLogCreateData) {
    return this.timeLogCreateUseCase.execute(data);
  }

  async getProjectSummary(
    userId: string,
    projectId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.timeLogGetProjectSummaryUseCase.execute(
      userId,
      projectId,
      startDate,
      endDate,
    );
  }

  async getDailySummary(userId: string, date: Date) {
    return this.timeLogGetDailyUseCase.execute(userId, date);
  }

  async getTaskWorkTime(taskId: string, userId: string) {
    return this.timeLogGetTaskTimeUseCase.execute(taskId, userId);
  }

  async getOverallSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.timeLogGetProjectSummaryUseCase.execute(
      userId,
      undefined,
      startDate,
      endDate,
    );
  }
}
