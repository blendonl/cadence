import { useState, useCallback, useEffect } from 'react';
import { getRoutineService } from '@core/di/hooks';
import { Routine } from '../domain/entities/Routine';
import { logger } from '@utils/logger';

export interface UseRoutineListDataReturn {
  routines: Routine[];
  loading: boolean;
  loadRoutines: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRoutineListData(): UseRoutineListDataReturn {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const routineService = getRoutineService();
      const result = await routineService.getRoutines();
      setRoutines(result);
    } catch (error) {
      logger.error('Failed to load routines', { error });
      console.error('Failed to load routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadRoutines();
  }, [loadRoutines]);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  return {
    routines,
    loading,
    loadRoutines,
    refresh,
  };
}
