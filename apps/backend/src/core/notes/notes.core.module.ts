import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityEventEmitter } from '../events/services/entity-event-emitter.service';
import { RepositoryEventWrapper } from '../events/services/repository-event-wrapper';
import { NOTE_REPOSITORY } from './repository/note.repository';
import { NotePrismaRepository } from './repository/note.prisma.repository';
import { NoteCreateUseCase } from './usecase/note.create.usecase';
import { NoteDeleteUseCase } from './usecase/note.delete.usecase';
import { NoteGetAllUseCase } from './usecase/note.get-all.usecase';
import { NoteGetOneUseCase } from './usecase/note.get-one.usecase';
import { NoteUpdateUseCase } from './usecase/note.update.usecase';
import { NotesCoreService } from './service/notes.core.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: NOTE_REPOSITORY,
      useFactory: (prisma: PrismaService, eventEmitter: EntityEventEmitter) => {
        const repository = new NotePrismaRepository(prisma);
        return RepositoryEventWrapper.wrap(repository, 'note', eventEmitter);
      },
      inject: [PrismaService, EntityEventEmitter],
    },
    NoteCreateUseCase,
    NoteGetAllUseCase,
    NoteGetOneUseCase,
    NoteUpdateUseCase,
    NoteDeleteUseCase,
    NotesCoreService,
  ],
  exports: [NotesCoreService],
})
export class NotesCoreModule {}
