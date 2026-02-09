import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AGENDA_REPOSITORY,
  type AgendaRepository,
} from '../repository/agenda.repository';

@Injectable()
export class AgendaDeleteUseCase {
  constructor(
    @Inject(AGENDA_REPOSITORY)
    private readonly agendaRepository: AgendaRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const agenda = await this.agendaRepository.findById(id);
    if (!agenda || agenda.userId !== userId) {
      throw new NotFoundException('Agenda not found');
    }
    return this.agendaRepository.delete(id);
  }
}
