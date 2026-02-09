import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
} from '../repository/agenda-item.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemDeleteUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
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
    return this.agendaItemRepository.delete(id);
  }
}
