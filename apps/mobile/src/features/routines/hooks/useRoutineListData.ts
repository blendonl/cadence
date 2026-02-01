import { useState, useCallback, useEffect } from 'react';
import { routineApi } from '../api/routineApi';
import { RoutineDetailDto } from 'shared-types';
import { logger } from '@utils/logger';

export interface UseRoutineListDataReturn {
  routines: RoutineDetailDto[];
  loading: boolean;
  loadRoutines: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRoutineListData(): UseRoutineListDataReturn {
  const [routines, setRoutines] = useState<RoutineDetailDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const result = await routineApi.getRoutines();
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
