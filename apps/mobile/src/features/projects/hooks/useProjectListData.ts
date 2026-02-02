import { useState, useCallback, useEffect } from 'react';
import { ProjectDto } from 'shared-types';
import { projectApi } from '../api/projectApi';

const PROJECT_PAGE_SIZE = 50;

export interface UseProjectListDataReturn {
  projects: ProjectDto[];
  loading: boolean;
  hasMore: boolean;
  currentPage: number;
  loadProjects: (page?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProjectListData(): UseProjectListDataReturn {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const loadProjects = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    try {
      const result = await projectApi.getProjects({ page, limit: PROJECT_PAGE_SIZE });
      const sanitizedItems = result.items.filter((item): item is ProjectDto => Boolean(item));
      const hasMore = result.page * result.limit < result.total;

      if (append) {
        setProjects((prev) => [...prev, ...sanitizedItems]);
      } else {
        setProjects(sanitizedItems);
      }

      setCurrentPage(page);
      setHasMore(hasMore);
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
