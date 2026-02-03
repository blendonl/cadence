import { Inject, Injectable } from '@nestjs/common';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteDeleteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(id: string): Promise<boolean> {
    const note = await this.noteRepository.findById(id);

    if (!note) {
      return false;
    }

    await this.noteRepository.delete(id);
    return true;
  }
}
