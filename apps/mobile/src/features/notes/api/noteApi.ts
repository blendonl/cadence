import { apiClient } from '@infrastructure/api/apiClient';
import {
  NoteDto,
  NoteDetailDto,
  NoteCreateRequestDto,
  NoteUpdateRequestDto,
} from 'shared-types';

export const noteApi = {
  async getNotes(params?: {
    projectId?: string;
    search?: string;
  }): Promise<NoteDetailDto[]> {
    const searchParams = new URLSearchParams();
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return apiClient.request<NoteDetailDto[]>(
      `/notes${query ? `?${query}` : ''}`
    );
  },

  async getNoteById(id: string): Promise<NoteDetailDto | null> {
    return apiClient.requestOrNull<NoteDetailDto>(`/notes/${id}`);
  },

  async createNote(request: NoteCreateRequestDto): Promise<NoteDto> {
    return apiClient.request<NoteDto>('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateNote(id: string, request: NoteUpdateRequestDto): Promise<NoteDto> {
    return apiClient.request<NoteDto>(`/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteNote(id: string): Promise<void> {
    await apiClient.request(`/notes/${id}`, { method: 'DELETE' });
  },
};
