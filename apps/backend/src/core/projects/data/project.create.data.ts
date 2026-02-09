import { ProjectStatus } from '../domain/project';

export interface ProjectCreateData {
  userId: string;
  name: string;
  slug?: string;
  description: string | null;
  color?: string;
  status?: ProjectStatus;
  filePath?: string | null;
}
