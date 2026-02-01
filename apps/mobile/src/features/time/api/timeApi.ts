import { apiClient } from '@infrastructure/api/apiClient';
import {
  TimeLogDto,
  TimeLogDetailDto,
  TimeLogSummaryDto,
  TimeLogCreateRequestDto,
  TimeLogUpdateRequestDto,
} from 'shared-types';

export const timeApi = {
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
    return apiClient.request<TimeLogDetailDto[]>(
      `/time-logs${query ? `?${query}` : ''}`
    );
  },

  async getTimeLogById(id: string): Promise<TimeLogDetailDto | null> {
    return apiClient.requestOrNull<TimeLogDetailDto>(`/time-logs/${id}`);
  },

  async createTimeLog(request: TimeLogCreateRequestDto): Promise<TimeLogDto> {
    return apiClient.request<TimeLogDto>('/time-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateTimeLog(id: string, request: TimeLogUpdateRequestDto): Promise<TimeLogDto> {
    return apiClient.request<TimeLogDto>(`/time-logs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteTimeLog(id: string): Promise<void> {
    await apiClient.request(`/time-logs/${id}`, { method: 'DELETE' });
  },

  async getSummary(params: {
    startDate: string;
    endDate: string;
  }): Promise<TimeLogSummaryDto[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('startDate', params.startDate);
    searchParams.set('endDate', params.endDate);

    return apiClient.request<TimeLogSummaryDto[]>(
      `/time-logs/summary?${searchParams.toString()}`
    );
  },
};
