import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { AgendaEnriched } from '../../agenda-item/usecase/agenda.get-enriched-by-date.usecase';

@Injectable()
export class AgendaGetDateRangeUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AgendaEnriched[]> {
    const agendas = await this.prisma.agenda.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            task: {
              include: {
                column: {
                  include: {
                    board: true,
                  },
                },
              },
            },
            routineTask: {
              include: {
                routine: true,
              },
            },
            logs: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { date: 'asc' },
    });

    return agendas as AgendaEnriched[];
  }
}
