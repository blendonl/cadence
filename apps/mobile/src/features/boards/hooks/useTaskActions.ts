import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Board } from '../domain/entities/Board';
import { Task } from '../domain/entities/Task';
import { getTaskService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

interface UseTaskActionsProps {
  board: Board | null;
  refreshBoard: () => Promise<void>;
  openMoveModal: (task: Task) => void;
  closeMoveModal: () => void;
}

export function useTaskActions({
  board,
  refreshBoard,
  openMoveModal,
  closeMoveModal,
}: UseTaskActionsProps) {
  const router = useRouter();
  const taskService = getTaskService();

  const handleTaskPress = useCallback(
    (task: Task) => {
      if (!board) return;
      router.push({
        pathname: '/tasks/[taskId]' as const,
        params: { taskId: task.id, boardId: board.id },
      });
    },
    [board, router]
  );

  const handleTaskLongPress = useCallback(
    async (task: Task) => {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      openMoveModal(task);
    },
    [openMoveModal]
  );

  const handleMoveToColumn = useCallback(
    async (task: Task, targetColumnId: string) => {
      if (!board) return;

      try {
        // Find target column
        const targetColumn = board.columns.find((col) => col.id === targetColumnId);
        if (!targetColumn) {
          alertService.showError('Target column not found');
          return;
        }

        // Move task
        await taskService.moveTaskBetweenColumns(board, task.id, targetColumnId);

        // Trigger success haptic
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Refresh board
        await refreshBoard();

        // Close modal
        closeMoveModal();
      } catch (error) {
        logger.error('Failed to move task', error, {
          taskId: task.id,
          targetColumnId,
        });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to move task');
      }
    },
    [board, taskService, refreshBoard, closeMoveModal]
  );

  const handleAddItem = useCallback(
    (columnId: string) => {
      if (!board) return;
      // Navigate to ItemDetail in create mode with the column ID
      router.push({
        pathname: '/tasks/new' as const,
        params: { boardId: board.id, columnId },
      });
    },
    [board, router]
  );

  return {
    handleTaskPress,
    handleTaskLongPress,
    handleMoveToColumn,
    handleAddItem,
  };
}
