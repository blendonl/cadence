import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Agenda } from '@prisma/client';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaGetOneUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Agenda> {
    const agenda = await this.agendaRepository.findById(id);
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda not found');
    }
    return agenda;
  }
}
