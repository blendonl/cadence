import { inject, injectable } from 'tsyringe';
import { ApiClient } from '@infrastructure/api/apiClient';
import { API_CLIENT } from '@core/di/tokens';
import {
  NoteCreateRequestDto,
  NoteDetailDto,
  NoteDto,
  NoteUpdateRequestDto,
} from 'shared-types';

@injectable()
export class NoteService {
  constructor(@inject(API_CLIENT) private apiClient: ApiClient) {}

  async getAllNotes(): Promise<NoteDetailDto[]> {
    return this.apiClient.request<NoteDetailDto[]>('/notes');
  }

  async getNotesByProject(projectId: string): Promise<NoteDetailDto[]> {
    return this.apiClient.request<NoteDetailDto[]>(
      `/notes?projectId=${encodeURIComponent(projectId)}`,
    );
  }

  async getNoteById(id: string): Promise<NoteDetailDto | null> {
    return this.apiClient.requestOrNull<NoteDetailDto>(`/notes/${id}`);
  }

  async createNote(request: NoteCreateRequestDto): Promise<NoteDto> {
    return this.apiClient.request<NoteDto>('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async updateNote(id: string, request: NoteUpdateRequestDto): Promise<NoteDto> {
    return this.apiClient.request<NoteDto>(`/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async deleteNote(id: string): Promise<void> {
    await this.apiClient.request(`/notes/${id}`, { method: 'DELETE' });
  }
}
