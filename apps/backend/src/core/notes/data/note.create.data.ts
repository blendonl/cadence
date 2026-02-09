import { NoteType } from '@prisma/client';

export interface NoteCreateData {
  userId: string;
  title: string;
  content?: string | null;
  type?: NoteType;
  tags?: string[];
  projectIds?: string[];
  boardIds?: string[];
  taskIds?: string[];
}
