import { EntityTimestamps } from '../../types/common.types';

/**
 * Note DTO
 */
export interface NoteDto extends EntityTimestamps {
  id: string;
  title: string;
  content: string;
  projectId: string | null;
  filePath: string | null;
  preview: string | null;
}

/**
 * Note with project name
 */
export interface NoteDetailDto extends NoteDto {
  projectName: string | null;
}

/**
 * Create note request
 */
export interface NoteCreateRequestDto {
  title: string;
  content?: string;
  projectId?: string;
}

/**
 * Update note request
 */
export interface NoteUpdateRequestDto {
  title?: string;
  content?: string;
  projectId?: string;
}
