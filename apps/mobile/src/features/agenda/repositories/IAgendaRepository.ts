import {
  AgendaItemEnrichedDto,
  AgendaItemUpdateRequestDto,
  AgendaViewMode,
  AgendaViewResponseDto,
} from 'shared-types';

export interface IAgendaRepository {
  getAgendaView(mode: AgendaViewMode, anchorDate: string, timezone: string): Promise<AgendaViewResponseDto>;
  getAgendaItemById(agendaId: string, itemId: string): Promise<AgendaItemEnrichedDto | null>;
  createAgendaItem(params: {
    agendaId: string;
    taskId?: string;
    type?: string;
    scheduledTime?: string | null;
    durationMinutes?: number | null;
  }): Promise<AgendaItemEnrichedDto>;
  updateAgendaItem(agendaId: string, id: string, request: AgendaItemUpdateRequestDto): Promise<AgendaItemEnrichedDto>;
  deleteAgendaItem(agendaId: string, id: string): Promise<void>;
  completeAgendaItem(agendaId: string, id: string): Promise<AgendaItemEnrichedDto>;
  markAsUnfinished(agendaId: string, id: string): Promise<AgendaItemEnrichedDto>;
  rescheduleAgendaItem(agendaId: string, id: string, newDate: string, newTime: string | null, duration: number | null): Promise<AgendaItemEnrichedDto>;
}
