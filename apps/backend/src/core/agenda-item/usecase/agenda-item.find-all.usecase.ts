import { Inject, Injectable } from '@nestjs/common';
import { AgendaItemStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';

export interface AgendaItemFindAllParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  query?: string;
  mode?: 'all' | 'unfinished';
  page?: number;
  limit?: number;
}

export interface AgendaItemFindAllResult {
  items: Array<{
    id: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    items: any[];
  }>;
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AgendaItemFindAllUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(params: AgendaItemFindAllParams): Promise<AgendaItemFindAllResult> {
    const agendaWhere: Prisma.AgendaWhereInput = {};
    if (params.userId) {
      agendaWhere.userId = params.userId;
    }
    if (params.startDate && params.endDate) {
      agendaWhere.date = {
        gte: params.startDate,
        lte: params.endDate,
      };
    }

    const agendas = await this.prisma.agenda.findMany({
      where: agendaWhere,
      orderBy: { date: 'asc' },
    });

    const enrichedAgendas = await Promise.all(
      agendas.map(async (agenda) => {
        let items: any[];

        if (params.mode === 'unfinished') {
          items = await this.agendaItemRepository.findUnfinishedByAgendaId(agenda.id);
        } else {
          const [tasks, routines, steps, sleepItems] = await Promise.all([
            this.agendaItemRepository.findTasksByAgendaId(agenda.id),
            this.agendaItemRepository.findRoutinesByAgendaId(agenda.id),
            this.agendaItemRepository.findStepsByAgendaId(agenda.id),
            this.agendaItemRepository.findSleepItemsByAgendaId(agenda.id),
          ]);
          items = [...tasks, ...routines, ...steps, ...sleepItems];
        }

        if (params.query) {
          const query = params.query.toLowerCase();
          items = items.filter((item: any) => {
            const taskTitle = item.task?.title?.toLowerCase() || '';
            const routineTaskName = item.routineTask?.name?.toLowerCase() || '';
            return taskTitle.includes(query) || routineTaskName.includes(query);
          });
        }

        return {
          ...agenda,
          items,
        };
      }),
    );

    const mergedByDate = this.mergeByDate(enrichedAgendas);
    const filled = params.startDate && params.endDate
      ? this.fillDateRange(mergedByDate, params.startDate, params.endDate)
      : mergedByDate;

    const page = params.page ?? 1;
    const limit = params.limit ?? 200;
    const skip = (page - 1) * limit;
    const paged = filled.slice(skip, skip + limit);

    return {
      items: paged,
      total: filled.length,
      page,
      limit,
    };
  }

  private toDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private mergeByDate(
    agendas: Array<{ id: string; date: Date; createdAt: Date; updatedAt: Date; items: any[] }>,
  ) {
    const byDate = new Map<string, { id: string; date: Date; createdAt: Date; updatedAt: Date; items: any[] }>();

    for (const agenda of agendas) {
      const dateKey = this.toDateKey(agenda.date);
      const existing = byDate.get(dateKey);
      if (existing) {
        existing.items.push(...agenda.items);
      } else {
        byDate.set(dateKey, { ...agenda, items: [...agenda.items] });
      }
    }

    return Array.from(byDate.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }

  private fillDateRange(
    agendas: Array<{ id: string; date: Date; createdAt: Date; updatedAt: Date; items: any[] }>,
    startDate: Date,
    endDate: Date,
  ) {
    const byDate = new Map<string, typeof agendas[number]>();
    for (const agenda of agendas) {
      byDate.set(this.toDateKey(agenda.date), agenda);
    }

    const result: typeof agendas = [];
    const current = new Date(startDate);
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(0, 0, 0, 0);

    while (current <= end) {
      const dateKey = this.toDateKey(current);
      const existing = byDate.get(dateKey);
      if (existing) {
        result.push(existing);
      } else {
        result.push({
          id: `empty-${dateKey}`,
          date: new Date(current),
          createdAt: new Date(current),
          updatedAt: new Date(current),
          items: [],
        });
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return result;
  }
}
