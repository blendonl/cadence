import { NoteType } from '@prisma/client';

export interface NoteListQueryData {
  projectId?: string;
  type?: NoteType;
}
