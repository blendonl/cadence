import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { TaskDto } from 'shared-types';
import { getTaskService } from '@core/di/hooks';
import alertService from '@services/AlertService';

interface UseTaskDetailActionsProps {
  task: TaskDto | null;
}

interface UseTaskDetailActionsReturn {
  handleDelete: () => void;
}

export function useTaskDetailActions({
  task,
}: UseTaskDetailActionsProps): UseTaskDetailActionsReturn {
  const router = useRouter();
  const taskService = getTaskService();

  const handleDelete = useCallback(() => {
    if (!task) return;

    alertService.showDestructiveConfirm(
      'Are you sure you want to delete this task? This action cannot be undone.',
      async () => {
        try {
          await taskService.deleteTask(task.id);
          router.back();
        } catch (error) {
          alertService.showError('Failed to delete task');
        }
      },
      undefined,
      'Delete Task'
    );
  }, [task, taskService, router]);

  return { handleDelete };
}
