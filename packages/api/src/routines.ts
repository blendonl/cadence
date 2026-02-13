import { IApiClient } from './client';
import {
  RoutineDetailDto,
  RoutineTaskDto,
  RoutineCreateRequestDto,
  RoutineUpdateRequestDto,
  RoutineTaskCreateRequestDto,
  RoutineTaskUpdateRequestDto,
} from 'shared-types';

export const createRoutineApi = (client: IApiClient) => ({
  async getRoutines(): Promise<RoutineDetailDto[]> {
    return client.request<RoutineDetailDto[]>('/routines');
  },

  async getRoutineById(id: string): Promise<RoutineDetailDto | null> {
    return client.requestOrNull<RoutineDetailDto>(`/routines/${id}`);
  },

  async createRoutine(request: RoutineCreateRequestDto): Promise<RoutineDetailDto> {
    return client.request<RoutineDetailDto>('/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateRoutine(id: string, request: RoutineUpdateRequestDto): Promise<RoutineDetailDto> {
    return client.request<RoutineDetailDto>(`/routines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteRoutine(id: string): Promise<void> {
    await client.request(`/routines/${id}`, { method: 'DELETE' });
  },

  async createRoutineTask(request: RoutineTaskCreateRequestDto): Promise<RoutineTaskDto> {
    return client.request<RoutineTaskDto>('/routine-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateRoutineTask(id: string, request: RoutineTaskUpdateRequestDto): Promise<RoutineTaskDto> {
    return client.request<RoutineTaskDto>(`/routine-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteRoutineTask(id: string): Promise<void> {
    await client.request(`/routine-tasks/${id}`, { method: 'DELETE' });
  },
});

export type RoutineApi = ReturnType<typeof createRoutineApi>;
