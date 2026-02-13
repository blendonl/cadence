'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api';
import type { TaskCreateRequestDto, TaskUpdateRequestDto, QuickTaskCreateRequestDto } from 'shared-types';
import { toast } from 'sonner';

export function useTasks(query?: { projectId?: string; boardId?: string; columnId?: string; search?: string }) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => taskApi.getTasks(query),
  });
}

export function useTaskDetail(taskId: string) {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => taskApi.getTaskDetail(taskId),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreateRequestDto) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Task created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useQuickCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuickTaskCreateRequestDto) => taskApi.quickCreateTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Task created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: TaskUpdateRequestDto }) =>
      taskApi.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Task deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
