import { IApiClient } from './client';
import { ColumnDto, ColumnCreateRequestDto, ColumnUpdateRequestDto } from 'shared-types';

export const createColumnApi = (client: IApiClient) => ({
  async getColumnById(columnId: string): Promise<ColumnDto | null> {
    return client.requestOrNull<ColumnDto>(`/columns/${columnId}`);
  },

  async createColumn(params: ColumnCreateRequestDto): Promise<ColumnDto> {
    return client.request<ColumnDto>('/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  async updateColumn(columnId: string, updates: ColumnUpdateRequestDto): Promise<ColumnDto> {
    return client.request<ColumnDto>(`/columns/${columnId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteColumn(columnId: string): Promise<void> {
    await client.request(`/columns/${columnId}`, { method: 'DELETE' });
  },
});

export type ColumnApi = ReturnType<typeof createColumnApi>;
