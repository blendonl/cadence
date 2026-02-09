import { Injectable } from '@nestjs/common';
import { AgendaViewCoreService } from '../service/agenda-view.core.service';

@Injectable()
export class AgendaViewGetWeekUseCase {
  constructor(private readonly agendaViewService: AgendaViewCoreService) {}

  async execute(userId: string, anchorDate: string, timeZone: string) {
    return this.agendaViewService.getWeekView(userId, anchorDate, timeZone);
  }
}
