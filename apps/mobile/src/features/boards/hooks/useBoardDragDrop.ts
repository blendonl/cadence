import { useCallback, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Board } from '../domain/entities/Board';
import { Task } from '@features/tasks/domain/entities/Task';
import { runOnJS } from 'react-native-reanimated';

interface UseBoardDragDropOptions {
  board: Board | null;
  onMoveTask: (taskId: string, targetColumnId: string) => Promise<boolean>;
  onValidateMove: (board: Board, taskId: string, targetColumnId: string) => Promise<{ valid: boolean; reason?: string }>;
}

interface UseBoardDragDropReturn {
  boardListRef: React.RefObject<FlatList>;
  handleDragStart: (task: Task) => void;
  handleDragEnd: (taskId: string, targetColumnId: string | null) => Promise<void>;
  validateDrop: (taskId: string, targetColumnId: string) => Promise<{ valid: boolean; reason?: string }>;
}

export function useBoardDragDrop(options: UseBoardDragDropOptions): UseBoardDragDropReturn {
  const { board, onMoveTask, onValidateMove } = options;
  const boardListRef = useRef<FlatList>(null);
  const activeDragRef = useRef<string | null>(null);

  const handleDragStart = useCallback((task: Task) => {
    console.log('[useBoardDragDrop] handleDragStart', task.id);
    activeDragRef.current = task.id;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleDragEnd = useCallback(
    async (taskId: string, targetColumnId: string | null) => {
      console.log('[useBoardDragDrop] handleDragEnd', taskId, targetColumnId);

      if (activeDragRef.current !== taskId) {
        console.log('[useBoardDragDrop] Stale drag operation ignored');
        return;
      }

      if (!targetColumnId || !board) {
        console.log('[useBoardDragDrop] No target or board');
        activeDragRef.current = null;
        return;
      }

      const task = board.getTaskById(taskId);
      if (!task) {
        console.log('[useBoardDragDrop] Task not found');
        activeDragRef.current = null;
        return;
      }

      if (task.columnId === targetColumnId) {
        console.log('[useBoardDragDrop] Same column');
        activeDragRef.current = null;
        return;
      }

      console.log('[useBoardDragDrop] Validating move...');
      const validation = await onValidateMove(board, taskId, targetColumnId);
      console.log('[useBoardDragDrop] Validation result:', validation);

      if (!validation.valid) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        activeDragRef.current = null;
        return;
      }

      console.log('[useBoardDragDrop] Moving task...');
      const success = await onMoveTask(taskId, targetColumnId);
      console.log('[useBoardDragDrop] Move result:', success);

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      activeDragRef.current = null;
    },
    [board, onMoveTask, onValidateMove]
  );

  const validateDrop = useCallback(
    async (taskId: string, targetColumnId: string) => {
      if (!board) {
        return { valid: false, reason: 'Board not loaded' };
      }

      return await onValidateMove(board, taskId, targetColumnId);
    },
    [board, onValidateMove]
  );

  useEffect(() => {
    return () => {
      activeDragRef.current = null;
    };
  }, [board]);

  return {
    boardListRef,
    handleDragStart,
    handleDragEnd,
    validateDrop,
  };
}
