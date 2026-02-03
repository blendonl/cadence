import { Inject, Injectable } from '@nestjs/common';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteGetOneUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(id: string) {
    return this.noteRepository.findById(id);
  }
}
