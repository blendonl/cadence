import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { AgendaItemEnriched } from './agenda.get-enriched-by-date.usecase';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemGetOneUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<AgendaItemWithLogs | null> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }
    await this.assertOwnership(item.agendaId, userId);
    return item;
  }

  async executeEnriched(id: string, userId: string): Promise<AgendaItemEnriched | null> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      return null;
    }
    await this.assertOwnership(item.agendaId, userId);
    return this.agendaItemRepository.findEnrichedById(id);
  }

  private async assertOwnership(agendaId: string, userId: string): Promise<void> {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id: agendaId },
      select: { userId: true },
    });
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda item not found');
    }
  }
}
