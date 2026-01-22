import { useState, useCallback } from 'react';
import { getProjectService } from '@core/di/hooks';
import { Project } from '../domain/entities/Project';

const PROJECT_PAGE_SIZE = 50;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projectService = getProjectService();
      const result = await projectService.getProjectsPaginated(1, PROJECT_PAGE_SIZE);
      setProjects(result.items);
      setPage(1);
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

    const nextPage = page + 1;
    setLoading(true);
    try {
      const projectService = getProjectService();
      const result = await projectService.getProjectsPaginated(nextPage, PROJECT_PAGE_SIZE);
      setProjects((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Failed to load more projects:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  return {
    projects,
    hasMore,
    loading,
    loadProjects,
    loadMore,
  };
}
