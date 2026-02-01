import { apiClient } from '@infrastructure/api/apiClient';
import {
  ProjectDto,
  ProjectDetailDto,
  ProjectListResponseDto,
  ProjectCreateRequestDto,
  ProjectUpdateRequestDto,
} from 'shared-types';

export const projectApi = {
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
    return apiClient.request<ProjectListResponseDto>(
      `/projects${query ? `?${query}` : ''}`
    );
  },

  async getProjectById(id: string): Promise<ProjectDetailDto | null> {
    return apiClient.requestOrNull<ProjectDetailDto>(`/projects/${id}`);
  },

  async createProject(request: ProjectCreateRequestDto): Promise<ProjectDto> {
    return apiClient.request<ProjectDto>('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateProject(id: string, request: ProjectUpdateRequestDto): Promise<ProjectDto> {
    return apiClient.request<ProjectDto>(`/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.request(`/projects/${id}`, { method: 'DELETE' });
  },
};
