'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi, columnApi } from '@/lib/api';
import type { ColumnCreateRequestDto, ColumnUpdateRequestDto } from 'shared-types';
import { toast } from 'sonner';

export function useBoardsByProject(projectId: string) {
  return useQuery({
    queryKey: ['boards', { projectId }],
    queryFn: () => boardApi.getBoardsByProject(projectId),
    enabled: !!projectId,
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId],
    queryFn: () => boardApi.getBoardById(boardId),
    enabled: !!boardId,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { projectId: string; name: string; description?: string }) =>
      boardApi.createBoard(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => boardApi.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ColumnCreateRequestDto) => columnApi.createColumn(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Column created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId, updates }: { columnId: string; updates: ColumnUpdateRequestDto }) =>
      columnApi.updateColumn(columnId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columnId: string) => columnApi.deleteColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Column deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
