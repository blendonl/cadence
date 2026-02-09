import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NoteUpdateData } from '../data/note.update.data';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteUpdateUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(id: string, userId: string, data: NoteUpdateData) {
    const note = await this.noteRepository.findById(id);

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    return this.noteRepository.update(id, data);
  }
}
