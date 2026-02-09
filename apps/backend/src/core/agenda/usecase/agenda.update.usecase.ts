import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import { AgendaUpdateData } from '../data/agenda.update.data';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaUpdateUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string, userId: string, data: AgendaUpdateData): Promise<Agenda> {
    const agenda = await this.agendaRepository.findById(id);
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda not found');
    }
    return this.agendaRepository.update(id, data);
  }
}
