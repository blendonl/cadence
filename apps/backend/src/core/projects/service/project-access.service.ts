import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertAccess(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        userId: true,
        teamId: true,
        members: { where: { userId }, select: { id: true }, take: 1 },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId === userId) return;

    if (project.members.length > 0) return;

    if (project.teamId) {
      const teamMember = await this.prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: project.teamId, userId } },
        select: { id: true },
      });
      if (teamMember) return;
    }

    throw new NotFoundException('Project not found');
  }

  async assertBoardAccess(userId: string, boardId: string): Promise<void> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.assertAccess(userId, board.projectId);
  }

  async assertColumnAccess(userId: string, columnId: string): Promise<void> {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      select: { board: { select: { projectId: true } } },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.assertAccess(userId, column.board.projectId);
  }

  async assertTaskAccess(userId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        column: {
          select: { board: { select: { projectId: true } } },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.assertAccess(userId, task.column.board.projectId);
  }
}
