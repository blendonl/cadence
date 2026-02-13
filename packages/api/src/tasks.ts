import { IApiClient } from './client';
import {
  TaskDto,
  TaskDetailDto,
  TaskCreateRequestDto,
  TaskCreateResponseDto,
  TaskUpdateRequestDto,
  PaginatedResponse,
  QuickTaskCreateRequestDto,
} from 'shared-types';

export const createTaskApi = (client: IApiClient) => ({
  async getAllTasks(query: { projectId?: string; boardId?: string } = {}): Promise<TaskDto[]> {
    const params = new URLSearchParams();
    if (query.projectId) params.append('projectId', query.projectId);
    if (query.boardId) params.append('boardId', query.boardId);

    const queryString = params.toString();
    return client.request<TaskDto[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
  },

  async getTasks(query: {
    projectId?: string;
    boardId?: string;
    columnId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<TaskDto>> {
    const params = new URLSearchParams();
    if (query.projectId) params.append('projectId', query.projectId);
    if (query.boardId) params.append('boardId', query.boardId);
    if (query.columnId) params.append('columnId', query.columnId);
    if (query.search) params.append('search', query.search);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    return client.request<PaginatedResponse<TaskDto>>(
      `/tasks${queryString ? `?${queryString}` : ''}`
    );
  },

  async getTaskDetail(taskId: string): Promise<TaskDetailDto | null> {
    return client.requestOrNull<TaskDetailDto>(`/tasks/${taskId}`);
  },

  async createTask(params: TaskCreateRequestDto): Promise<TaskCreateResponseDto> {
    return client.request<TaskCreateResponseDto>('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  async quickCreateTask(params: QuickTaskCreateRequestDto): Promise<TaskDto> {
    return client.request<TaskDto>('/tasks/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  async updateTask(taskId: string, updates: TaskUpdateRequestDto): Promise<TaskDto> {
    return client.request<TaskDto>(`/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(taskId: string): Promise<void> {
    await client.request(`/tasks/${taskId}`, { method: 'DELETE' });
  },
});

export type TaskApi = ReturnType<typeof createTaskApi>;
