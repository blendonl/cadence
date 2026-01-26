import { useState, useEffect, useCallback } from 'react';
import { getRoutineService } from '@core/di/hooks';
import { Routine, RoutineId } from '../domain/entities/Routine';
import { logger } from '@utils/logger';

export interface UseRoutineDetailReturn {
  routine: Routine | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useRoutineDetail(routineId: RoutineId): UseRoutineDetailReturn {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoutine = useCallback(async () => {
    if (!routineId) {
      setLoading(false);
      return;
    }

    try {
      const routineService = getRoutineService();
      const result = await routineService.getRoutineById(routineId);
      setRoutine(result);
      setError(null);
    } catch (err) {
      logger.error('Failed to load routine', { error: err, routineId });
      console.error('Failed to load routine:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    loadRoutine();
  }, [loadRoutine]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadRoutine();
  }, [loadRoutine]);

  return {
    routine,
    loading,
    error,
    refresh,
  };
}
