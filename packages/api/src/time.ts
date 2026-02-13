import { IApiClient } from './client';
import {
  TimeLogDto,
  TimeLogDetailDto,
  TimeLogSummaryDto,
  TimeLogCreateRequestDto,
  TimeLogUpdateRequestDto,
} from 'shared-types';

export const createTimeApi = (client: IApiClient) => ({
  async getTimeLogs(params?: {
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeLogDetailDto[]> {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const query = searchParams.toString();
    return client.request<TimeLogDetailDto[]>(
      `/time-logs${query ? `?${query}` : ''}`
    );
  },

  async getTimeLogById(id: string): Promise<TimeLogDetailDto | null> {
    return client.requestOrNull<TimeLogDetailDto>(`/time-logs/${id}`);
  },

  async createTimeLog(request: TimeLogCreateRequestDto): Promise<TimeLogDto> {
    return client.request<TimeLogDto>('/time-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateTimeLog(id: string, request: TimeLogUpdateRequestDto): Promise<TimeLogDto> {
    return client.request<TimeLogDto>(`/time-logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteTimeLog(id: string): Promise<void> {
    await client.request(`/time-logs/${id}`, { method: 'DELETE' });
  },

  async getSummary(params: {
    startDate: string;
    endDate: string;
  }): Promise<TimeLogSummaryDto[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('startDate', params.startDate);
    searchParams.set('endDate', params.endDate);

    return client.request<TimeLogSummaryDto[]>(
      `/time-logs/summary?${searchParams.toString()}`
    );
  },
});

export type TimeApi = ReturnType<typeof createTimeApi>;
