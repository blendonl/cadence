import { useState, useCallback } from 'react';
import { goalApi } from '../api/goalApi';
import { GoalDto } from 'shared-types';

export function useGoals() {
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [loading, setLoading] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const allGoals = await goalApi.getGoals();
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
