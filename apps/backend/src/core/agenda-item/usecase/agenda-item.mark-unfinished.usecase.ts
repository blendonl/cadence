import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AGENDA_ITEM_REPOSITORY,
  type AgendaItemRepository,
  type AgendaItemWithLogs,
} from '../repository/agenda-item.repository';
import { AgendaItemStatus, AgendaItemLogType } from '@prisma/client';
import { AgendaItemLogCreateUseCase } from './agenda-item-log.create.usecase';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AgendaItemMarkUnfinishedUseCase {
  constructor(
    @Inject(AGENDA_ITEM_REPOSITORY)
    private readonly agendaItemRepository: AgendaItemRepository,
    private readonly logUseCase: AgendaItemLogCreateUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string, userId: string): Promise<AgendaItemWithLogs> {
    const item = await this.agendaItemRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Agenda item with id ${id} not found`);
    }

    const agenda = await this.prisma.agenda.findUnique({
      where: { id: item.agendaId },
      select: { userId: true },
    });
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException(`Agenda item with id ${id} not found`);
    }

    const updated = await this.agendaItemRepository.update(id, {
      status: AgendaItemStatus.UNFINISHED,
    });

    await this.logUseCase.execute({
      agendaItemId: id,
      type: AgendaItemLogType.MARKED_UNFINISHED,
      previousValue: { status: item.status },
      newValue: { status: AgendaItemStatus.UNFINISHED, markedAt: new Date() },
      notes: 'Manually marked as unfinished',
    });

    return updated;
  }
}
