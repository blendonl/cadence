import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Board } from '../domain/entities/Board';
import { Column } from '../domain/entities/Column';
import { Task } from '../domain/entities/Task';
import { getColumnService, getTaskService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

interface UseColumnActionsProps {
  board: Board | null;
  refreshBoard: () => Promise<void>;
  openColumnFormForCreate: () => void;
  openColumnFormForEdit: (column: Column) => void;
  closeColumnForm: () => void;
  openMoveModal: (task: Task) => void;
  closeColumnActions: () => void;
}

export function useColumnActions({
  board,
  refreshBoard,
  openColumnFormForCreate,
  openColumnFormForEdit,
  closeColumnForm,
  openMoveModal,
  closeColumnActions,
}: UseColumnActionsProps) {
  const columnService = getColumnService();
  const taskService = getTaskService();

  const handleCreateColumn = useCallback(() => {
    openColumnFormForCreate();
  }, [openColumnFormForCreate]);

  const handleSaveColumn = useCallback(
    async (name: string, limit?: number, columnId?: string) => {
      if (!board) return;

      try {
        if (columnId) {
          // Update existing column
          await columnService.updateColumn(board.id, columnId, {
            name,
            limit: limit ?? null,
          });
        } else {
          // Create new column
          const column = await columnService.createColumn(
            board.id,
            name,
            board.columns.length
          );
          if (limit !== undefined) {
            await columnService.updateColumn(board.id, column.id, { limit });
          }
        }

        await refreshBoard();
        alertService.showSuccess(`Column ${columnId ? 'updated' : 'created'}`);
      } catch (error) {
        logger.error('Failed to save column', error);
        throw error; // Re-throw for modal to handle
      }
    },
    [board, columnService, refreshBoard]
  );

  const handleRenameColumn = useCallback(
    (column: Column) => {
      openColumnFormForEdit(column);
      closeColumnActions();
    },
    [openColumnFormForEdit, closeColumnActions]
  );

  const handleMoveColumn = useCallback(
    async (column: Column, direction: 'left' | 'right') => {
      if (!board) return;

      const currentIndex = board.columns.findIndex((c) => c.id === column.id);
      const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= board.columns.length) return;

      try {
        // Get target column
        const targetColumn = board.columns[newIndex];

        // CRITICAL FIX: Use immutable position swapping
        const newSourcePosition = targetColumn.position;
        const newTargetPosition = column.position;

        // Update both columns with swapped positions
        await Promise.all([
          columnService.updateColumn(board.id, column.id, {
            position: newSourcePosition,
          }),
          columnService.updateColumn(board.id, targetColumn.id, {
            position: newTargetPosition,
          }),
        ]);

        // Refresh board to get fresh state from backend
        await refreshBoard();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        closeColumnActions();
      } catch (error) {
        logger.error('Failed to move column', error);
        alertService.showError('Failed to move column');
      }
    },
    [board, columnService, refreshBoard, closeColumnActions]
  );

  const handleClearColumn = useCallback(
    async (column: Column) => {
      if (!board || column.tasks.length === 0) return;

      Alert.alert(
        'Clear Column',
        `Delete all ${column.tasks.length} tasks in "${column.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete All',
            style: 'destructive',
            onPress: async () => {
              try {
                for (const task of [...column.tasks]) {
                  await taskService.deleteTask(board, task.id);
                }
                await refreshBoard();
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                closeColumnActions();
              } catch (error) {
                logger.error('Failed to clear column', error);
                alertService.showError('Failed to clear column');
              }
            },
          },
        ]
      );
    },
    [board, taskService, refreshBoard, closeColumnActions]
  );

  const handleMoveAllTasks = useCallback(
    (column: Column) => {
      if (column.tasks.length === 0) return;
      closeColumnActions();
      // Use the first task to trigger the move modal
      openMoveModal(column.tasks[0]);
    },
    [openMoveModal, closeColumnActions]
  );

  const handleDeleteColumn = useCallback(
    async (column: Column) => {
      if (!board) return;

      if (column.tasks.length > 0) {
        alertService.showError(
          'Cannot delete column with tasks. Clear tasks first.'
        );
        return;
      }

      Alert.alert('Delete Column', `Delete "${column.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await columnService.deleteColumn(board.id, column.id);
              await refreshBoard();
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              closeColumnActions();
            } catch (error) {
              logger.error('Failed to delete column', error);
              alertService.showError(
                error instanceof Error
                  ? error.message
                  : 'Failed to delete column'
              );
            }
          },
        },
      ]);
    },
    [board, columnService, refreshBoard, closeColumnActions]
  );

  return {
    handleCreateColumn,
    handleSaveColumn,
    handleRenameColumn,
    handleMoveColumn,
    handleClearColumn,
    handleMoveAllTasks,
    handleDeleteColumn,
  };
}
