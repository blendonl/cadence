import { NoteType } from '@prisma/client';

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
