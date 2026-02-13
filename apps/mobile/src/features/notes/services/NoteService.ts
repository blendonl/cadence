import { inject, injectable } from 'tsyringe';
import { ApiClient } from '@infrastructure/api/apiClient';
import { API_CLIENT } from '@core/di/tokens';
import {
  NoteCreateRequestDto,
  NoteDetailDto,
  NoteDto,
  NoteUpdateRequestDto,
} from 'shared-types';
import { createNoteApi } from '@cadence/api';

@injectable()
export class NoteService {
  private noteApi;

  constructor(@inject(API_CLIENT) private apiClient: ApiClient) {
    this.noteApi = createNoteApi(apiClient);
  }

  async getAllNotes(): Promise<NoteDetailDto[]> {
    return this.noteApi.getAllNotes();
  }

  async getNotesByProject(projectId: string): Promise<NoteDetailDto[]> {
    return this.noteApi.getNotesByProject(projectId);
  }

  async getNoteById(id: string): Promise<NoteDetailDto | null> {
    return this.noteApi.getNoteById(id);
  }

  async createNote(request: NoteCreateRequestDto): Promise<NoteDto> {
    return this.noteApi.createNote(request);
  }

  async updateNote(id: string, request: NoteUpdateRequestDto): Promise<NoteDto> {
    return this.noteApi.updateNote(id, request);
  }

  async deleteNote(id: string): Promise<void> {
    return this.noteApi.deleteNote(id);
  }
}
