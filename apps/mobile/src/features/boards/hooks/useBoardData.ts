import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Board } from '../domain/entities/Board';
import { getBoardService } from '@/core/di/hooks';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

export function useBoardData(boardId: string | undefined) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const boardService = getBoardService();

  const loadBoard = useCallback(async () => {
    if (!boardId) return;

    try {
      const loadedBoard = await boardService.getBoardById(boardId);

      if (loadedBoard) {
        setBoard(loadedBoard);
      } else {
        alertService.showError('Board not found');
        router.back();
      }
    } catch (error) {
      logger.error('Failed to load board', error, { boardId });
      alertService.showError('Failed to load board');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [boardId, boardService, router]);

  const refreshBoard = useCallback(async () => {
    if (!board) return;

    try {
      const updatedBoard = await boardService.getBoardById(board.id);
      if (updatedBoard) {
        setBoard(updatedBoard);
      }
    } catch (error) {
      logger.error('Failed to refresh board', error, { boardId: board.id });
      alertService.showError('Failed to refresh board');
    }
  }, [board, boardService]);

  // Load board on mount or when boardId changes
  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  return {
    board,
    loading,
    loadBoard,
    refreshBoard,
  };
}
