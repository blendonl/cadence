import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AgendaItemEnrichedDto } from 'shared-types';
import { agendaApi } from '@features/agenda/api/agendaApi';
import { isItemCompleted, isOrphanedItem } from '@features/agenda/utils/agendaHelpers';

export type ActionLoadingState = 'delete' | 'reschedule' | 'complete' | null;

export function useAgendaItemDetail(agendaId: string | undefined, itemId: string | undefined) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendaItem, setAgendaItem] = useState<AgendaItemEnrichedDto | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);
  const [actionLoading, setActionLoading] = useState<ActionLoadingState>(null);

  const loadAgendaItem = useCallback(async () => {
    if (!agendaId || !itemId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const item = await agendaApi.getAgendaItemById(agendaId, itemId);
      if (!item) {
        Alert.alert('Error', 'Agenda item not found');
        router.back();
        return;
      }
      setAgendaItem(item);
      setNotes(item.notes || '');
    } catch (error) {
      console.error('Failed to load agenda item:', error);
      Alert.alert('Error', 'Failed to load agenda item');
    } finally {
      setLoading(false);
    }
  }, [agendaId, itemId, router]);

  useEffect(() => {
    loadAgendaItem();
  }, [loadAgendaItem]);

  const handleDelete = useCallback(() => {
    if (!agendaItem) return;
    Alert.alert(
      'Delete Agenda Item',
      'Are you sure you want to delete this agenda item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading('delete');
              await agendaApi.deleteAgendaItem(agendaItem.agendaId, agendaItem.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete agenda item');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }, [agendaItem, router]);

  const handleReschedule = useCallback(async (newDate: string, newTime: string | null, duration: number | null) => {
    if (!agendaItem) return;
    try {
      setActionLoading('reschedule');
      await agendaApi.rescheduleAgendaItem(
        agendaItem.agendaId,
        agendaItem.id,
        newDate,
        newTime,
        duration
      );
      setShowReschedule(false);
      await loadAgendaItem();
      Alert.alert('Success', 'Agenda item rescheduled');
    } catch (error) {
      Alert.alert('Error', 'Failed to reschedule');
    } finally {
      setActionLoading(null);
    }
  }, [agendaItem, loadAgendaItem]);

  const handleSaveNotes = useCallback(async () => {
    if (!agendaItem) return;
    try {
      await agendaApi.updateAgendaItem(agendaItem.agendaId, agendaItem.id, { notes });
      setIsEditingNotes(false);
      Alert.alert('Success', 'Notes saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notes');
    }
  }, [agendaItem, notes]);

  const handleToggleComplete = useCallback(async () => {
    if (!agendaItem) return;
    try {
      setActionLoading('complete');
      if (isItemCompleted(agendaItem)) {
        await agendaApi.markAsUnfinished(agendaItem.agendaId, agendaItem.id);
      } else {
        await agendaApi.completeAgendaItem(agendaItem.agendaId, agendaItem.id);
      }
      await loadAgendaItem();
    } catch (error) {
      Alert.alert('Error', 'Failed to update completion status');
    } finally {
      setActionLoading(null);
    }
  }, [agendaItem, loadAgendaItem]);

  const handleNavigateToTask = useCallback(() => {
    if (!agendaItem) return;
    const isOrphaned = isOrphanedItem(agendaItem);
    if (agendaItem.taskId && !isOrphaned) {
      const boardId = agendaItem.task?.boardId;
      const query = boardId ? `?boardId=${boardId}` : '';
      router.push(`/tasks/${agendaItem.taskId}${query}`);
    }
  }, [agendaItem, router]);

  return {
    loading,
    agendaItem,
    notes,
    setNotes,
    isEditingNotes,
    setIsEditingNotes,
    showReschedule,
    setShowReschedule,
    actionLoading,
    handleDelete,
    handleReschedule,
    handleSaveNotes,
    handleToggleComplete,
    handleNavigateToTask,
  };
}
