import { NoteType } from '@prisma/client';

export interface NoteCreateData {
  title: string;
  content?: string | null;
  type?: NoteType;
  tags?: string[];
  projectIds?: string[];
  boardIds?: string[];
  taskIds?: string[];
}
