import { useCallback } from 'react';
import { Alert } from 'react-native';
import { getAgendaService } from '@core/di/hooks';
import { ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';
import { TaskScheduleData } from '../components/TaskScheduleModal';

interface UseAgendaActionsProps {
  onDataChanged: (date?: string) => void;
}

export function useAgendaActions({ onDataChanged }: UseAgendaActionsProps) {
  const handleToggleComplete = useCallback(async (scheduledItem: ScheduledAgendaItem) => {
    try {
      const agendaService = getAgendaService();
      const agendaItem = scheduledItem.agendaItem;

      if (agendaItem.completed_at) {
        agendaItem.markIncomplete();
      } else {
        agendaItem.markComplete();
      }

      await agendaService.updateAgendaItem(agendaItem);
      onDataChanged(agendaItem.scheduled_date);
    } catch (error) {
      console.error('Failed to update agenda item status:', error);
      Alert.alert('Error', 'Failed to update agenda item status');
    }
  }, [onDataChanged]);

  const handleDelete = useCallback(async (scheduledItem: ScheduledAgendaItem) => {
    try {
      const agendaService = getAgendaService();
      const itemDate = scheduledItem.agendaItem.scheduled_date;
      await agendaService.deleteAgendaItem(scheduledItem.agendaItem);
      onDataChanged(itemDate);
    } catch (error) {
      console.error('Failed to delete agenda item:', error);
      Alert.alert('Error', 'Failed to delete agenda item');
    }
  }, [onDataChanged]);

  const handleCreate = useCallback(async (data: TaskScheduleData) => {
    try {
      const agendaService = getAgendaService();
      const agendaId = data.date;

      await agendaService.createAgendaItem({
        agendaId,
        taskId: data.taskId,
        type: data.taskType,
        startAt: data.time ? `${data.date}T${data.time}:00` : null,
        duration: data.durationMinutes,
        status: 'PENDING',
        position: 0,
        notes: null,
        notificationId: null,
      });

      onDataChanged(data.date);
    } catch (error) {
      throw error;
    }
  }, [onDataChanged]);

  return {
    handleToggleComplete,
    handleDelete,
    handleCreate,
  };
}
