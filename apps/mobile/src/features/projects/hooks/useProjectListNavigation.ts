import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useProjectContext } from '@core/ProjectContext';
import { Project } from '../domain/entities/Project';

export interface UseProjectListNavigationReturn {
  navigateToProject: (project: Project) => void;
}

export function useProjectListNavigation(): UseProjectListNavigationReturn {
  const router = useRouter();
  const { setCurrentProject } = useProjectContext();

  const navigateToProject = useCallback(
    (project: Project) => {
      setCurrentProject(project);
      router.push(`/projects/${project.id}`);
    },
    [router, setCurrentProject]
  );

  return {
    navigateToProject,
  };
}
