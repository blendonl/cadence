import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteDeleteUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findById(id);

    if (!note || note.userId !== userId) {
      throw new NotFoundException('Note not found');
    }

    await this.noteRepository.delete(id);
  }
}
