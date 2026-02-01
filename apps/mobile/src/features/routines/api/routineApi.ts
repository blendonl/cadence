import { apiClient } from '@infrastructure/api/apiClient';
import {
  RoutineDetailDto,
  RoutineTaskDto,
  RoutineCreateRequestDto,
  RoutineUpdateRequestDto,
  RoutineTaskCreateRequestDto,
  RoutineTaskUpdateRequestDto,
} from 'shared-types';

export const routineApi = {
  async getRoutines(): Promise<RoutineDetailDto[]> {
    return apiClient.request<RoutineDetailDto[]>('/routines');
  },

  async getRoutineById(id: string): Promise<RoutineDetailDto | null> {
    return apiClient.requestOrNull<RoutineDetailDto>(`/routines/${id}`);
  },

  async createRoutine(request: RoutineCreateRequestDto): Promise<RoutineDetailDto> {
    return apiClient.request<RoutineDetailDto>('/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateRoutine(id: string, request: RoutineUpdateRequestDto): Promise<RoutineDetailDto> {
    return apiClient.request<RoutineDetailDto>(`/routines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteRoutine(id: string): Promise<void> {
    await apiClient.request(`/routines/${id}`, { method: 'DELETE' });
  },

  async createRoutineTask(request: RoutineTaskCreateRequestDto): Promise<RoutineTaskDto> {
    return apiClient.request<RoutineTaskDto>('/routine-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateRoutineTask(id: string, request: RoutineTaskUpdateRequestDto): Promise<RoutineTaskDto> {
    return apiClient.request<RoutineTaskDto>(`/routine-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteRoutineTask(id: string): Promise<void> {
    await apiClient.request(`/routine-tasks/${id}`, { method: 'DELETE' });
  },
};
