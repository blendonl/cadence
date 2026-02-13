'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaApi } from '@/lib/api';
import type { AgendaItemUpdateRequestDto, AgendaViewMode } from 'shared-types';
import type { AgendaItemCreateInput } from '@cadence/api';
import { toast } from 'sonner';

export function useAgendaView(mode: AgendaViewMode, anchorDate: string) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return useQuery({
    queryKey: ['agenda', mode, anchorDate],
    queryFn: () => agendaApi.getAgendaView({ mode, anchorDate, timezone }),
  });
}

export function useCreateAgendaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AgendaItemCreateInput) => agendaApi.createAgendaItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      toast.success('Item added');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateAgendaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agendaId, id, data }: { agendaId: string; id: string; data: AgendaItemUpdateRequestDto }) =>
      agendaApi.updateAgendaItem(agendaId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCompleteAgendaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agendaId, id }: { agendaId: string; id: string }) =>
      agendaApi.completeAgendaItem(agendaId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteAgendaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agendaId, id }: { agendaId: string; id: string }) =>
      agendaApi.deleteAgendaItem(agendaId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      toast.success('Item removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRescheduleAgendaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      agendaId,
      id,
      newDate,
      newTime,
      duration,
    }: {
      agendaId: string;
      id: string;
      newDate: string;
      newTime: string | null;
      duration: number | null;
    }) => agendaApi.rescheduleAgendaItem(agendaId, id, newDate, newTime, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMarkAsUnfinished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ agendaId, id }: { agendaId: string; id: string }) =>
      agendaApi.markAsUnfinished(agendaId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
