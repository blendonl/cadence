import { Inject, Injectable } from '@nestjs/common';
import { NoteListQueryData } from '../data/note.list.query.data';
import { NOTE_REPOSITORY, type NoteRepository } from '../repository/note.repository';

@Injectable()
export class NoteGetAllUseCase {
  constructor(
    @Inject(NOTE_REPOSITORY)
    private readonly noteRepository: NoteRepository,
  ) {}

  async execute(query: NoteListQueryData) {
    return this.noteRepository.findAll(query);
  }
}
