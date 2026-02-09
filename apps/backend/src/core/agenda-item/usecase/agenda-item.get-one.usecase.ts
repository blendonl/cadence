import { Inject, Injectable } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { AgendaItemEnriched } from './agenda.get-enriched-by-date.usecase';

@Injectable()
export class AgendaItemGetOneUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
  ) {}

  async execute(id: string): Promise<AgendaItemWithLogs | null> {
    return this.agendaItemRepository.findById(id);
  }

  async executeEnriched(id: string): Promise<AgendaItemEnriched | null> {
    return this.agendaItemRepository.findEnrichedById(id);
  }
}
