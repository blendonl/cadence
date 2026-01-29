import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '@/utils/logger';

type ColumnSortOrder = 'position' | 'name' | 'taskCount';

interface TaskFilterOptions {
  priority?: string[];
  status?: string[];
  hasParent?: boolean;
}

interface BoardViewState {
  showParentGroups: boolean;
  columnSortOrder: ColumnSortOrder;
  taskFilterOptions: TaskFilterOptions;
}

interface UseBoardViewStateReturn extends BoardViewState {
  toggleParentGroups: () => void;
  setColumnSortOrder: (order: ColumnSortOrder) => void;
  setTaskFilterOptions: (options: TaskFilterOptions) => void;
  resetFilters: () => void;
  isLoading: boolean;
}

const DEFAULT_VIEW_STATE: BoardViewState = {
  showParentGroups: false,
  columnSortOrder: 'position',
  taskFilterOptions: {},
};

const getStorageKey = (boardId: string) => `board_view_state_${boardId}`;

export function useBoardViewState(boardId: string): UseBoardViewStateReturn {
  const [viewState, setViewState] = useState<BoardViewState>(DEFAULT_VIEW_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadViewState = async () => {
      try {
        const key = getStorageKey(boardId);
        const stored = await AsyncStorage.getItem(key);

        if (stored) {
          const parsed = JSON.parse(stored) as BoardViewState;
          setViewState(parsed);
        }
      } catch (error) {
        logger.error('Failed to load board view state', error, { boardId });
      } finally {
        setIsLoading(false);
      }
    };

    loadViewState();
  }, [boardId]);

  const saveViewState = useCallback(
    async (newState: BoardViewState) => {
      try {
        const key = getStorageKey(boardId);
        await AsyncStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        logger.error('Failed to save board view state', error, { boardId });
      }
    },
    [boardId]
  );

  const toggleParentGroups = useCallback(() => {
    setViewState((prev) => {
      const newState = { ...prev, showParentGroups: !prev.showParentGroups };
      saveViewState(newState);
      return newState;
    });
  }, [saveViewState]);

  const setColumnSortOrder = useCallback(
    (order: ColumnSortOrder) => {
      setViewState((prev) => {
        const newState = { ...prev, columnSortOrder: order };
        saveViewState(newState);
        return newState;
      });
    },
    [saveViewState]
  );

  const setTaskFilterOptions = useCallback(
    (options: TaskFilterOptions) => {
      setViewState((prev) => {
        const newState = { ...prev, taskFilterOptions: options };
        saveViewState(newState);
        return newState;
      });
    },
    [saveViewState]
  );

  const resetFilters = useCallback(() => {
    setViewState((prev) => {
      const newState = {
        ...prev,
        taskFilterOptions: {},
      };
      saveViewState(newState);
      return newState;
    });
  }, [saveViewState]);

  return {
    ...viewState,
    toggleParentGroups,
    setColumnSortOrder,
    setTaskFilterOptions,
    resetFilters,
    isLoading,
  };
}
