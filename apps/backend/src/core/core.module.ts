import { Module } from '@nestjs/common';
import { ProjectsCoreModule } from './projects/projects.core.module';
import { BoardsCoreModule } from './boards/boards.core.module';
import { ColumnsCoreModule } from './columns/columns.core.module';
import { TasksCoreModule } from './tasks/tasks.core.module';
import { EventsCoreModule } from './events/events.core.module';
import { AgendaCoreModule } from './agenda/agenda.core.module';
import { AgendaItemCoreModule } from './agenda-item/agenda-item.core.module';
import { RoutinesCoreModule } from './routines/routines.core.module';
import { AlarmsCoreModule } from './alarms/alarms.core.module';
import { NotesCoreModule } from './notes/notes.core.module';
import { UsersCoreModule } from './users/users.core.module';
import { AuthCoreModule } from './auth/auth.core.module';

@Module({
  imports: [
    EventsCoreModule,
    UsersCoreModule,
    AuthCoreModule,
    ProjectsCoreModule,
    BoardsCoreModule,
    ColumnsCoreModule,
    TasksCoreModule,
    AgendaCoreModule,
    AgendaItemCoreModule,
    RoutinesCoreModule,
    AlarmsCoreModule,
    NotesCoreModule,
  ],
})
export class CoreModule {}
