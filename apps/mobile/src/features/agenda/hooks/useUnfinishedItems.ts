import { useState, useCallback } from 'react';
import { getAgendaService } from '@core/di/hooks';
import { ScheduledAgendaItem } from '../domain/interfaces/AgendaService.interface';

export function useUnfinishedItems() {
  const [unfinishedItems, setUnfinishedItems] = useState<ScheduledAgendaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUnfinished = useCallback(async () => {
    try {
      setLoading(true);
      const agendaService = getAgendaService();
      const items = await agendaService.getUnfinishedItems();
      setUnfinishedItems(items);
    } catch (error) {
      console.error('Failed to load unfinished items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    unfinishedItems,
    loading,
    loadUnfinished,
  };
}
