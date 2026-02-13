'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/lib/api';
import type { GoalCreateRequestDto, GoalUpdateRequestDto } from 'shared-types';
import { toast } from 'sonner';

export function useGoals(params?: { status?: 'active' | 'completed' | 'archived' }) {
  return useQuery({
    queryKey: ['goals', params],
    queryFn: () => goalApi.getGoals(params),
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goals', id],
    queryFn: () => goalApi.getGoalById(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalCreateRequestDto) => goalApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalUpdateRequestDto }) =>
      goalApi.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
