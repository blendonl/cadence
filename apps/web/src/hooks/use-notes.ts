'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteApi } from '@/lib/api';
import type { NoteCreateRequestDto, NoteUpdateRequestDto } from 'shared-types';
import { toast } from 'sonner';

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: () => noteApi.getAllNotes(),
  });
}

export function useNotesByProject(projectId: string) {
  return useQuery({
    queryKey: ['notes', { projectId }],
    queryFn: () => noteApi.getNotesByProject(projectId),
    enabled: !!projectId,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: () => noteApi.getNoteById(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NoteCreateRequestDto) => noteApi.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteUpdateRequestDto }) =>
      noteApi.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => noteApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
