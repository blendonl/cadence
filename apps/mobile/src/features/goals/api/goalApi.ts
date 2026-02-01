import { apiClient } from '@infrastructure/api/apiClient';
import {
  GoalDto,
  GoalCreateRequestDto,
  GoalUpdateRequestDto,
} from 'shared-types';

export const goalApi = {
  async getGoals(params?: {
    status?: 'active' | 'completed' | 'archived';
  }): Promise<GoalDto[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return apiClient.request<GoalDto[]>(
      `/goals${query ? `?${query}` : ''}`
    );
  },

  async getGoalById(id: string): Promise<GoalDto | null> {
    return apiClient.requestOrNull<GoalDto>(`/goals/${id}`);
  },

  async createGoal(request: GoalCreateRequestDto): Promise<GoalDto> {
    return apiClient.request<GoalDto>('/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateGoal(id: string, request: GoalUpdateRequestDto): Promise<GoalDto> {
    return apiClient.request<GoalDto>(`/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.request(`/goals/${id}`, { method: 'DELETE' });
  },
};
