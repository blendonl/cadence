import { Injectable } from '@nestjs/common';
import { NoteCreateData } from '../data/note.create.data';
import { NoteListQueryData } from '../data/note.list.query.data';
import { NoteUpdateData } from '../data/note.update.data';
import { NoteCreateUseCase } from '../usecase/note.create.usecase';
import { NoteDeleteUseCase } from '../usecase/note.delete.usecase';
import { NoteGetAllUseCase } from '../usecase/note.get-all.usecase';
import { NoteGetOneUseCase } from '../usecase/note.get-one.usecase';
import { NoteUpdateUseCase } from '../usecase/note.update.usecase';

@Injectable()
export class NotesCoreService {
  constructor(
    private readonly noteCreateUseCase: NoteCreateUseCase,
    private readonly noteGetAllUseCase: NoteGetAllUseCase,
    private readonly noteGetOneUseCase: NoteGetOneUseCase,
    private readonly noteUpdateUseCase: NoteUpdateUseCase,
    private readonly noteDeleteUseCase: NoteDeleteUseCase,
  ) {}

  async createNote(data: NoteCreateData) {
    return this.noteCreateUseCase.execute(data);
  }

  async getNotes(query: NoteListQueryData) {
    return this.noteGetAllUseCase.execute(query);
  }

  async getNoteById(id: string) {
    return this.noteGetOneUseCase.execute(id);
  }

  async updateNote(id: string, data: NoteUpdateData) {
    return this.noteUpdateUseCase.execute(id, data);
  }

  async deleteNote(id: string) {
    return this.noteDeleteUseCase.execute(id);
  }
}
