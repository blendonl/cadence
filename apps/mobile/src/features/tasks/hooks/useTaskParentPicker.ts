import { useState, useCallback } from 'react';
import { Task } from '../domain/entities/Task';
import { getTaskService } from '@core/di/hooks';
import alertService from '@services/AlertService';
import logger from '@utils/logger';

interface UseTaskParentPickerReturn {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
}

export function useTaskParentPicker(boardId: string): UseTaskParentPickerReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const taskService = getTaskService();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const allTasks = await taskService.getTasksByBoard(boardId);
      setTasks(allTasks);
    } catch (error) {
      logger.error('Failed to fetch tasks for parent picker', error, { boardId });
      alertService.showError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [boardId, taskService]);

  return {
    tasks,
    loading,
    fetchTasks,
  };
}
