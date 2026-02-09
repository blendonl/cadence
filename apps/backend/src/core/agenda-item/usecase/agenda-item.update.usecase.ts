import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AgendaItemUpdateData } from '../data/agenda-item.update.data';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemUpdateUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string, data: AgendaItemUpdateData): Promise<AgendaItemWithLogs> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException('Agenda item not found');
    }
    const agenda = await this.prisma.agenda.findUnique({
      where: { id: item.agendaId },
      select: { userId: true },
    });
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda item not found');
    }
    return this.agendaItemRepository.update(id, data);
  }
}
