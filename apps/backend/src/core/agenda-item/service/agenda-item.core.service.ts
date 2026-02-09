import { Injectable } from '@nestjs/common';
import { AgendaItemCreateData } from '../data/agenda-item.create.data';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import { AgendaItemCreateUseCase } from '../usecase/agenda-item.create.usecase';
import { AgendaItemGetAllUseCase } from '../usecase/agenda-item.get-all.usecase';
import { AgendaItemGetOneUseCase } from '../usecase/agenda-item.get-one.usecase';
import { AgendaItemUpdateUseCase } from '../usecase/agenda-item.update.usecase';
import { AgendaItemDeleteUseCase } from '../usecase/agenda-item.delete.usecase';
import { AgendaItemGetOrphanedUseCase } from '../usecase/agenda-item.get-orphaned.usecase';
import { AgendaItemGetOverdueUseCase } from '../usecase/agenda-item.get-overdue.usecase';
import { AgendaItemGetUpcomingUseCase } from '../usecase/agenda-item.get-upcoming.usecase';
import { AgendaItemGetUnfinishedUseCase } from '../usecase/agenda-item.get-unfinished.usecase';
import { AgendaItemCompleteUseCase } from '../usecase/agenda-item.complete.usecase';
import { AgendaItemRescheduleUseCase } from '../usecase/agenda-item.reschedule.usecase';
import { AgendaItemMarkUnfinishedUseCase } from '../usecase/agenda-item.mark-unfinished.usecase';
import { AgendaItemFindAllUseCase } from '../usecase/agenda-item.find-all.usecase';
import { AgendaGetEnrichedByDateUseCase } from '../usecase/agenda.get-enriched-by-date.usecase';

@Injectable()
export class AgendaItemCoreService {
  constructor(
    private readonly agendaItemCreateUseCase: AgendaItemCreateUseCase,
    private readonly agendaItemGetAllUseCase: AgendaItemGetAllUseCase,
    private readonly agendaItemGetOneUseCase: AgendaItemGetOneUseCase,
    private readonly agendaItemUpdateUseCase: AgendaItemUpdateUseCase,
    private readonly agendaItemDeleteUseCase: AgendaItemDeleteUseCase,
    private readonly agendaItemGetOrphanedUseCase: AgendaItemGetOrphanedUseCase,
    private readonly agendaItemGetOverdueUseCase: AgendaItemGetOverdueUseCase,
    private readonly agendaItemGetUpcomingUseCase: AgendaItemGetUpcomingUseCase,
    private readonly agendaItemGetUnfinishedUseCase: AgendaItemGetUnfinishedUseCase,
    private readonly agendaItemCompleteUseCase: AgendaItemCompleteUseCase,
    private readonly agendaItemRescheduleUseCase: AgendaItemRescheduleUseCase,
    private readonly agendaItemMarkUnfinishedUseCase: AgendaItemMarkUnfinishedUseCase,
    private readonly agendaItemFindAllUseCase: AgendaItemFindAllUseCase,
    private readonly agendaGetEnrichedByDateUseCase: AgendaGetEnrichedByDateUseCase,
  ) {}

  async createAgendaItem(agendaId: string, data: AgendaItemCreateData, userId?: string) {
    return this.agendaItemCreateUseCase.execute(agendaId, data, userId);
  }

  async getAgendaItems(agendaId: string, userId: string) {
    return this.agendaItemGetAllUseCase.execute(agendaId, userId);
  }

  async getAgendaItem(id: string, userId: string) {
    return this.agendaItemGetOneUseCase.execute(id, userId);
  }

  async getEnrichedAgendaItem(id: string, userId: string) {
    return this.agendaItemGetOneUseCase.executeEnriched(id, userId);
  }

  async updateAgendaItem(id: string, userId: string, data: AgendaItemUpdateData) {
    return this.agendaItemUpdateUseCase.execute(id, userId, data);
  }

  async deleteAgendaItem(id: string, userId: string) {
    return this.agendaItemDeleteUseCase.execute(id, userId);
  }

  async getOrphanedAgendaItems(userId: string) {
    return this.agendaItemGetOrphanedUseCase.execute(userId);
  }

  async getOverdueAgendaItems(userId: string) {
    return this.agendaItemGetOverdueUseCase.execute(userId);
  }

  async getUpcomingAgendaItems(userId: string, days: number = 7) {
    return this.agendaItemGetUpcomingUseCase.execute(userId, days);
  }

  async getUnfinishedAgendaItems(userId: string, beforeDate?: Date) {
    return this.agendaItemGetUnfinishedUseCase.execute(userId, beforeDate);
  }

  async completeAgendaItem(id: string, userId: string, completedAt?: Date, notes?: string) {
    return this.agendaItemCompleteUseCase.execute(id, userId, completedAt, notes);
  }

  async rescheduleAgendaItem(
    id: string,
    userId: string,
    newDate: Date,
    startAt?: Date | null,
    duration?: number | null,
  ) {
    return this.agendaItemRescheduleUseCase.execute(id, userId, newDate, startAt, duration);
  }

  async markAsUnfinished(id: string, userId: string) {
    return this.agendaItemMarkUnfinishedUseCase.execute(id, userId);
  }

  async findAgendaItems(params: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    query?: string;
    mode?: 'all' | 'unfinished';
    page?: number;
    limit?: number;
  }) {
    return this.agendaItemFindAllUseCase.execute(params);
  }

  async getEnrichedAgendaByDate(date: Date, userId?: string) {
    return this.agendaGetEnrichedByDateUseCase.execute(date, userId);
  }
}
