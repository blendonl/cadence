import { Inject, Injectable } from '@nestjs/common';
import { NoteCreateData } from '../data/note.create.data';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteCreateUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(data: NoteCreateData) {
    return this.noteRepository.create({
      ...data,
      content: data.content ?? '',
    });
  }
}
