import { NoteCreateData } from '../data/note.create.data';
import { NoteFindOneData } from '../data/note.find.one.data';
import { NoteListQueryData } from '../data/note.list.query.data';
import { NoteUpdateData } from '../data/note.update.data';

export const NOTE_REPOSITORY = Symbol('NOTE_REPOSITORY');

export interface NoteRepository {
  findAll(query: NoteListQueryData): Promise<NoteFindOneData[]>;
  findById(id: string): Promise<NoteFindOneData | null>;
  create(data: NoteCreateData): Promise<NoteFindOneData>;
  update(id: string, data: NoteUpdateData): Promise<NoteFindOneData | null>;
  delete(id: string): Promise<void>;
}
