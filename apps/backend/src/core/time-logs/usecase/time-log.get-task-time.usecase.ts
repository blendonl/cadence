import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TimeLog } from '@prisma/client';
import {
  TIME_LOG_REPOSITORY,
  type TimeLogRepository,
} from '../repository/time-log.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TimeLogGetTaskTimeUseCase {
  constructor(
    @Inject(TIME_LOG_REPOSITORY)
    private readonly timeLogRepository: TimeLogRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(taskId: string, userId: string): Promise<TimeLog[]> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        column: {
          select: { board: { select: { project: { select: { userId: true } } } } },
        },
      },
    });
    if (!task || task.column.board.project.userId !== userId) {
      throw new NotFoundException('Task not found');
    }
    return this.timeLogRepository.findByTaskId(taskId);
  }
}
