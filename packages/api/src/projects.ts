import { IApiClient } from './client';
import {
  ProjectDto,
  ProjectDetailDto,
  ProjectListResponseDto,
  ProjectCreateRequestDto,
  ProjectUpdateRequestDto,
} from 'shared-types';

export const createProjectApi = (client: IApiClient) => ({
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'archived' | 'completed';
    search?: string;
  }): Promise<ProjectListResponseDto> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return client.request<ProjectListResponseDto>(
      `/projects${query ? `?${query}` : ''}`
    );
  },

  async getProjectById(id: string): Promise<ProjectDetailDto | null> {
    return client.requestOrNull<ProjectDetailDto>(`/projects/${id}`);
  },

  async createProject(request: ProjectCreateRequestDto): Promise<ProjectDto> {
    return client.request<ProjectDto>('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateProject(id: string, request: ProjectUpdateRequestDto): Promise<ProjectDto> {
    return client.request<ProjectDto>(`/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteProject(id: string): Promise<void> {
    await client.request(`/projects/${id}`, { method: 'DELETE' });
  },
});

export type ProjectApi = ReturnType<typeof createProjectApi>;
