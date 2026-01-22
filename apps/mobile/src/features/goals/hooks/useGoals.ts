import { useState, useCallback } from 'react';
import { getGoalService } from '@core/di/hooks';
import { Goal } from '../domain/entities/Goal';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const goalService = getGoalService();
      const allGoals = await goalService.getAllGoals();
      setGoals(allGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    goals,
    loading,
    loadGoals,
  };
}
