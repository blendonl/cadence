import { useCallback } from 'react';
import { Alert } from 'react-native';
import { ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';

interface UseAgendaItemHandlersProps {
  onToggleComplete: (item: ScheduledAgendaItem) => void;
  onDelete: (item: ScheduledAgendaItem) => void;
}

export function useAgendaItemHandlers({
  onToggleComplete,
  onDelete,
}: UseAgendaItemHandlersProps) {

  const handleItemPress = useCallback((item: ScheduledAgendaItem) => {
    // TODO: Navigate to detail screen once it's created
    Alert.alert(
      'Item Details',
      `View details for: ${item.task?.title || 'Agenda Item'}\n\nDetail screen coming soon.`,
      [{ text: 'OK' }]
    );
  }, []);

  const handleItemLongPress = useCallback((item: ScheduledAgendaItem) => {
    Alert.alert(
      item.task?.title || 'Agenda Item',
      'Choose an action',
      [
        {
          text: 'View Details',
          onPress: () => handleItemPress(item),
        },
        {
          text: 'Reschedule',
          onPress: () => handleItemPress(item),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Agenda Item',
              'Are you sure you want to delete this scheduled item?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(item),
                },
              ]
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [handleItemPress, onDelete]);

  return {
    handleItemPress,
    handleItemLongPress,
    handleToggleComplete: onToggleComplete,
  };
}
