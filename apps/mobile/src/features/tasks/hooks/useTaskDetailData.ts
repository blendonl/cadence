import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Task } from '@/features/tasks/domain/entities/Task';
import { getTaskService } from '@core/di/hooks';
import alertService from '@services/AlertService';

interface UseTaskDetailDataProps {
  boardId: string;
  taskId?: string | null;
}

interface UseTaskDetailDataReturn {
  task: Task | null;
  allTasks: Task[];
  loading: boolean;
}

export function useTaskDetailData({
  boardId,
  taskId,
}: UseTaskDetailDataProps): UseTaskDetailDataReturn {
  const [task, setTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const taskService = getTaskService();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedTasks, loadedTask] = await Promise.all([
          taskService.getAllTasks({ boardId }),
          taskId ? taskService.getTaskDetail(taskId) : null,
        ]);

        setAllTasks(loadedTasks);

        if (taskId && !loadedTask) {
          alertService.showError('Task not found');
          router.back();
          return;
        }

        setTask(loadedTask);
      } catch (error) {
        alertService.showError('Failed to load data');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [boardId, taskId, taskService, router]);

  return { task, allTasks, loading };
}
