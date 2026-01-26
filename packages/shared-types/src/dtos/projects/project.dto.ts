import { EntityTimestamps } from '../../types/common.types';

/**
 * Project DTO - API representation with camelCase
 */
export interface ProjectDto extends EntityTimestamps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  status: 'active' | 'archived' | 'completed';
  filePath: string | null;
}

/**
 * Project board summary for nested responses
 */
export interface ProjectBoardSummaryDto {
  id: string;
  name: string;
  columnCount: number;
}

/**
 * Project note summary for nested responses
 */
export interface ProjectNoteSummaryDto {
  id: string;
  title: string;
  content: string;
  preview: string | null;
  updatedAt: string;
}

/**
 * Project statistics
 */
export interface ProjectStatsDto {
  boardCount: number;
  noteCount: number;
  timeThisWeek: number;
}

/**
 * Detailed project with related entities
 */
export interface ProjectDetailDto extends ProjectDto {
  boards: ProjectBoardSummaryDto[];
  notes: ProjectNoteSummaryDto[];
  stats: ProjectStatsDto;
}

/**
 * Paginated project list response
 */
export interface ProjectListResponseDto {
  items: ProjectDto[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Create project request
 */
export interface ProjectCreateRequestDto {
  name: string;
  description?: string;
  color?: string;
  status?: 'active' | 'archived' | 'completed';
}

/**
 * Update project request
 */
export interface ProjectUpdateRequestDto {
  name?: string;
  description?: string;
  color?: string;
  status?: 'active' | 'archived' | 'completed';
}
