import { EntityTimestamps } from '../../types/common.types';
import { BoardDto } from '../boards';
import { ProjectDto } from '../projects';
import { TaskDto } from '../tasks';

export enum NoteType {
  General = 'GENERAL',
  Meeting = 'MEETING',
  Daily = 'DAILY',
  Task = 'TASK',
}

export enum EntityType {
  Project = 'project',
  Board = 'board',
  Task = 'task',
}

/**
 * Note DTO
 */
export interface NoteDto extends EntityTimestamps {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  preview?: string | null;
  projects?: ProjectDto[];
  boards?: BoardDto[];
  tasks?: TaskDto[];
  tags?: string[];
  wordCount?: number;
}

/**
 * Note with project name
 */
export interface NoteDetailDto extends NoteDto {}

/**
 * Create note request
 */
export interface NoteCreateRequestDto {
  type?: NoteType;
  title: string;
  content?: string;
  tags?: string[];
  projects?: ProjectDto[];
  boards?: BoardDto[];
  tasks?: TaskDto[];
}

/**
 * Update note request
 */
export interface NoteUpdateRequestDto {
  type?: NoteType;
  title?: string;
  content?: string;
  tags?: string[];
  projects?: ProjectDto[];
  boards?: BoardDto[];
  tasks?: TaskDto[];
}
