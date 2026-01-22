import { useState, useCallback } from 'react';
import { getAgendaService } from '@core/di/hooks';
import { DayAgenda } from '../domain/interfaces/AgendaService.interface';

export function useAgendaData() {
  const [agendaData, setAgendaData] = useState<DayAgenda[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const agendaService = getAgendaService();
      const data = await agendaService.getAgendaForDateRange(startDate, endDate);
      setAgendaData(data);
    } catch (error) {
      console.error('Failed to load agenda data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSingleDay = useCallback(async (date: string) => {
    try {
      const agendaService = getAgendaService();
      const dayAgenda = await agendaService.getAgendaForDate(date);

      setAgendaData(prev => {
        const existing = prev.find(d => d.date === date);
        if (existing) {
          return prev.map(d => d.date === date ? dayAgenda : d);
        }
        return [...prev, dayAgenda].sort((a, b) => a.date.localeCompare(b.date));
      });
    } catch (error) {
      console.error(`Failed to update day ${date}:`, error);
    }
  }, []);

  return {
    agendaData,
    loading,
    loadData,
    updateSingleDay,
  };
}
