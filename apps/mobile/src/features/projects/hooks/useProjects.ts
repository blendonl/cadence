import { useState, useCallback } from 'react';
import { projectApi } from '../api/projectApi';
import { ProjectDto } from 'shared-types';

const PROJECT_PAGE_SIZE = 50;

export function useProjects() {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await projectApi.getProjects({ page: 1, limit: PROJECT_PAGE_SIZE });
      setProjects(result.projects);
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
      const result = await projectApi.getProjects({ page: nextPage, limit: PROJECT_PAGE_SIZE });
      setProjects((prev) => [...prev, ...result.projects]);
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
