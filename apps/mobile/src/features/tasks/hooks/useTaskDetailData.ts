import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { TaskDto } from 'shared-types';
import { getTaskService } from '@core/di/hooks';
import alertService from '@services/AlertService';

interface UseTaskDetailDataProps {
  boardId: string;
  taskId?: string | null;
}

interface UseTaskDetailDataReturn {
  task: TaskDto | null;
  allTasks: TaskDto[];
  loading: boolean;
}

export function useTaskDetailData({
  boardId,
  taskId,
}: UseTaskDetailDataProps): UseTaskDetailDataReturn {
  const [task, setTask] = useState<TaskDto | null>(null);
  const [allTasks, setAllTasks] = useState<TaskDto[]>([]);
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
