import {
  AgendaItemEnrichedDto,
  AgendaItemUpdateRequestDto,
  AgendaViewMode,
  AgendaViewResponseDto,
} from 'shared-types';
import { agendaApi } from '../api/agendaApi';
import { IAgendaRepository } from './IAgendaRepository';

export class AgendaRepository implements IAgendaRepository {
  private viewCache = new Map<string, { data: AgendaViewResponseDto; timestamp: number }>();
  private readonly CACHE_TTL_MS = 30000;

  async getAgendaView(mode: AgendaViewMode, anchorDate: string, timezone: string): Promise<AgendaViewResponseDto> {
    const cacheKey = `${mode}:${anchorDate}:${timezone}`;
    const cached = this.viewCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const data = await agendaApi.getAgendaView({ mode, anchorDate, timezone });
    this.viewCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getAgendaItemById(agendaId: string, itemId: string): Promise<AgendaItemEnrichedDto | null> {
    return agendaApi.getAgendaItemById(agendaId, itemId);
  }

  async createAgendaItem(params: {
    agendaId: string;
    taskId?: string;
    type?: string;
    scheduledTime?: string | null;
    durationMinutes?: number | null;
  }): Promise<AgendaItemEnrichedDto> {
    this.invalidateCache();
    return agendaApi.createAgendaItem(params);
  }

  async updateAgendaItem(agendaId: string, id: string, request: AgendaItemUpdateRequestDto): Promise<AgendaItemEnrichedDto> {
    this.invalidateCache();
    return agendaApi.updateAgendaItem(agendaId, id, request);
  }

  async deleteAgendaItem(agendaId: string, id: string): Promise<void> {
    this.invalidateCache();
    return agendaApi.deleteAgendaItem(agendaId, id);
  }

  async completeAgendaItem(agendaId: string, id: string): Promise<AgendaItemEnrichedDto> {
    this.invalidateCache();
    return agendaApi.completeAgendaItem(agendaId, id);
  }

  async markAsUnfinished(agendaId: string, id: string): Promise<AgendaItemEnrichedDto> {
    this.invalidateCache();
    return agendaApi.markAsUnfinished(agendaId, id);
  }

  async rescheduleAgendaItem(
    agendaId: string,
    id: string,
    newDate: string,
    newTime: string | null,
    duration: number | null
  ): Promise<AgendaItemEnrichedDto> {
    this.invalidateCache();
    return agendaApi.rescheduleAgendaItem(agendaId, id, newDate, newTime, duration);
  }

  invalidateCache(): void {
    this.viewCache.clear();
  }
}
