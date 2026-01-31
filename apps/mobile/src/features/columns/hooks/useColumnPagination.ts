import { useState, useCallback, useRef } from 'react';
import { TaskDto, PaginatedResponse } from 'shared-types';
import { useTaskService } from '@/core/di/hooks';
import logger from '@/utils/logger';

interface UseColumnPaginationParams {
  columnId: string;
  initialTasks: TaskDto[];
  initialPage?: number;
  pageSize?: number;
}

interface UseColumnPaginationReturn {
  tasks: TaskDto[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setTasks: (tasks: TaskDto[]) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useColumnPagination({
  columnId,
  initialTasks,
  initialPage = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseColumnPaginationParams): UseColumnPaginationReturn {
  const [tasks, setTasks] = useState<TaskDto[]>(initialTasks);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTasks.length >= pageSize);
  const taskService = useTaskService();
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || loading) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      logger.info('[useColumnPagination] Loading more tasks', {
        columnId,
        page: currentPage + 1,
        pageSize,
      });

      const response = await taskService.getTasks({
        columnId,
        page: currentPage + 1,
        limit: pageSize,
      });

      if (response.items.length > 0) {
        setTasks((prev) => [...prev, ...response.items]);
        setCurrentPage((prev) => prev + 1);
        setHasMore(response.items.length >= pageSize);
      } else {
        setHasMore(false);
      }

      logger.info('[useColumnPagination] Loaded more tasks', {
        columnId,
        newTasksCount: response.items.length,
        totalTasks: tasks.length + response.items.length,
      });
    } catch (error) {
      logger.error('Failed to load more tasks', error as Error, { columnId });
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [columnId, currentPage, hasMore, loading, pageSize, taskService, tasks.length]);

  const refresh = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      logger.info('[useColumnPagination] Refreshing tasks', { columnId });

      const response = await taskService.getTasks({
        columnId,
        page: 1,
        limit: pageSize,
      });

      setTasks(response.items);
      setCurrentPage(1);
      setHasMore(response.items.length >= pageSize);
    } catch (error) {
      logger.error('Failed to refresh tasks', error as Error, { columnId });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [columnId, pageSize, taskService]);

  return {
    tasks,
    loading,
    hasMore,
    loadMore,
    refresh,
    setTasks,
  };
}
