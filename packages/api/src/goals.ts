import { IApiClient } from './client';
import {
  GoalDto,
  GoalCreateRequestDto,
  GoalUpdateRequestDto,
} from 'shared-types';

export const createGoalApi = (client: IApiClient) => ({
  async getGoals(params?: {
    status?: 'active' | 'completed' | 'archived';
  }): Promise<GoalDto[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    return client.request<GoalDto[]>(`/goals${query ? `?${query}` : ''}`);
  },

  async getGoalById(id: string): Promise<GoalDto | null> {
    return client.requestOrNull<GoalDto>(`/goals/${id}`);
  },

  async createGoal(request: GoalCreateRequestDto): Promise<GoalDto> {
    return client.request<GoalDto>('/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateGoal(id: string, request: GoalUpdateRequestDto): Promise<GoalDto> {
    return client.request<GoalDto>(`/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteGoal(id: string): Promise<void> {
    await client.request(`/goals/${id}`, { method: 'DELETE' });
  },
});

export type GoalApi = ReturnType<typeof createGoalApi>;
