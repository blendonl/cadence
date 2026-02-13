import { IApiClient } from './client';
import {
  NoteDto,
  NoteDetailDto,
  NoteCreateRequestDto,
  NoteUpdateRequestDto,
} from 'shared-types';

export const createNoteApi = (client: IApiClient) => ({
  async getAllNotes(): Promise<NoteDetailDto[]> {
    return client.request<NoteDetailDto[]>('/notes');
  },

  async getNotesByProject(projectId: string): Promise<NoteDetailDto[]> {
    return client.request<NoteDetailDto[]>(
      `/notes?projectId=${encodeURIComponent(projectId)}`
    );
  },

  async getNoteById(id: string): Promise<NoteDetailDto | null> {
    return client.requestOrNull<NoteDetailDto>(`/notes/${id}`);
  },

  async createNote(request: NoteCreateRequestDto): Promise<NoteDto> {
    return client.request<NoteDto>('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async updateNote(id: string, request: NoteUpdateRequestDto): Promise<NoteDto> {
    return client.request<NoteDto>(`/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async deleteNote(id: string): Promise<void> {
    await client.request(`/notes/${id}`, { method: 'DELETE' });
  },
});

export type NoteApi = ReturnType<typeof createNoteApi>;
