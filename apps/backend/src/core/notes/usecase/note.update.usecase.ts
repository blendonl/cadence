import { Inject, Injectable } from '@nestjs/common';
import { NoteUpdateData } from '../data/note.update.data';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteUpdateUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(id: string, data: NoteUpdateData) {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      return null;
    }

    return this.noteRepository.update(id, data);
  }
}
