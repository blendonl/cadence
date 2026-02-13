import { IApiClient } from './client';
import { BoardDto, BoardDetailDto, BoardListResponseDto } from 'shared-types';

export const createBoardApi = (client: IApiClient) => ({
  async getBoardsByProject(projectId: string): Promise<BoardDto[]> {
    const response = await client.request<BoardListResponseDto | null>(
      `/boards?projectId=${projectId}`
    );
    if (!response || !Array.isArray(response.items)) return [];
    return response.items;
  },

  async getAllBoards(): Promise<BoardDto[]> {
    const response = await client.request<BoardListResponseDto | null>('/boards');
    if (!response || !Array.isArray(response.items)) return [];
    return response.items;
  },

  async getBoardById(boardId: string): Promise<BoardDetailDto | null> {
    return client.requestOrNull<BoardDetailDto>(`/boards/${boardId}`);
  },

  async createBoard(params: {
    projectId: string;
    name: string;
    description?: string;
  }): Promise<BoardDto> {
    return client.request<BoardDto>('/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  },

  async deleteBoard(boardId: string): Promise<void> {
    await client.request(`/boards/${boardId}`, { method: 'DELETE' });
  },
});

export type BoardApi = ReturnType<typeof createBoardApi>;
