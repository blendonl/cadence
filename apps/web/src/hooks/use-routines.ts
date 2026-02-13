'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineApi } from '@/lib/api';
import type {
  RoutineCreateRequestDto,
  RoutineUpdateRequestDto,
  RoutineTaskCreateRequestDto,
  RoutineTaskUpdateRequestDto,
} from 'shared-types';
import { toast } from 'sonner';

export function useRoutines() {
  return useQuery({
    queryKey: ['routines'],
    queryFn: () => routineApi.getRoutines(),
  });
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: ['routines', id],
    queryFn: () => routineApi.getRoutineById(id),
    enabled: !!id,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoutineCreateRequestDto) => routineApi.createRoutine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Routine created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoutineUpdateRequestDto }) =>
      routineApi.updateRoutine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Routine updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routineApi.deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      toast.success('Routine deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateRoutineTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoutineTaskCreateRequestDto) => routineApi.createRoutineTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateRoutineTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoutineTaskUpdateRequestDto }) =>
      routineApi.updateRoutineTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteRoutineTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routineApi.deleteRoutineTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
