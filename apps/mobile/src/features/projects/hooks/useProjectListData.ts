import { useState, useCallback, useEffect } from 'react';
import { getProjectService } from '@core/di/hooks';
import { Project } from '../domain/entities/Project';

const PROJECT_PAGE_SIZE = 50;

export interface UseProjectListDataReturn {
  projects: Project[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
  loadProjects: (page?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProjectListData(): UseProjectListDataReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    try {
      const projectService = getProjectService();
      const result = await projectService.getProjectsPaginated(page, PROJECT_PAGE_SIZE);

      if (append) {
        setProjects((prev) => [...prev, ...result.items]);
      } else {
        setProjects(result.items);
      }

      setCurrentPage(page);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }
    await loadProjects(currentPage + 1, true);
  }, [loading, hasMore, currentPage, loadProjects]);

  const refresh = useCallback(async () => {
    await loadProjects(1, false);
  }, [loadProjects]);

  // Initial load
  useEffect(() => {
    loadProjects(1, false);
  }, [loadProjects]);

  return {
    projects,
    loading,
    hasMore,
    currentPage,
    loadProjects,
    loadMore,
    refresh,
  };
}
