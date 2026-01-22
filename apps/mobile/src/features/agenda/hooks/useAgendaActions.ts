import { useCallback } from 'react';
import { Alert } from 'react-native';
import { getAgendaService, getBoardService } from '@core/di/hooks';
import { ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';
import { Board } from '@features/boards/domain/entities/Board';
import { AgendaFormData } from '../components/AgendaItemFormModal';

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

  const handleCreate = useCallback(async (data: AgendaFormData) => {
    try {
      const agendaService = getAgendaService();
      await agendaService.createAgendaItem(
        data.projectId,
        data.boardId,
        data.taskId,
        data.date,
        data.time,
        data.durationMinutes,
        data.taskType,
        data.location || data.attendees ? {
          location: data.location,
          attendees: data.attendees,
        } : undefined
      );
      onDataChanged(data.date);
    } catch (error) {
      throw error;
    }
  }, [onDataChanged]);

  const handleLoadBoards = useCallback(async (projectId: string): Promise<Board[]> => {
    try {
      const boardService = getBoardService();
      return await boardService.getBoardsByProject(projectId);
    } catch (error) {
      console.error('Failed to load boards:', error);
      return [];
    }
  }, []);

  return {
    handleToggleComplete,
    handleDelete,
    handleCreate,
    handleLoadBoards,
  };
}
