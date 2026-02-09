import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemGetAllUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(agendaId: string, userId: string): Promise<AgendaItemWithLogs[]> {
    const agenda = await this.prisma.agenda.findUnique({
      where: { id: agendaId },
      select: { userId: true },
    });
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda not found');
    }
    return this.agendaItemRepository.findAllByAgendaId(agendaId);
  }
}
