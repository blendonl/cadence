'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeApi } from '@/lib/api';
import type { TimeLogCreateRequestDto, TimeLogUpdateRequestDto } from 'shared-types';
import { toast } from 'sonner';

export function useTimeLogs(params?: { projectId?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['time-logs', params],
    queryFn: () => timeApi.getTimeLogs(params),
  });
}

export function useTimeLogSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['time-logs', 'summary', startDate, endDate],
    queryFn: () => timeApi.getSummary({ startDate, endDate }),
    enabled: !!startDate && !!endDate,
  });
}

export function useCreateTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TimeLogCreateRequestDto) => timeApi.createTimeLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast.success('Time log created');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimeLogUpdateRequestDto }) =>
      timeApi.updateTimeLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast.success('Time log updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeApi.deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] });
      toast.success('Time log deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
