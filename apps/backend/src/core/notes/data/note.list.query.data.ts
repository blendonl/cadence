import { NoteType } from '@prisma/client';

export interface NoteListQueryData {
  userId: string;
  projectId?: string;
  type?: NoteType;
}
