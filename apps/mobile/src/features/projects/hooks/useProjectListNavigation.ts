import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useProjectContext } from '@core/ProjectContext';
import { ProjectDto } from 'shared-types';

export interface UseProjectListNavigationReturn {
  navigateToProject: (project: ProjectDto) => void;
}

export function useProjectListNavigation(): UseProjectListNavigationReturn {
  const router = useRouter();
  const { setCurrentProject } = useProjectContext();

  const navigateToProject = useCallback(
    (project: ProjectDto) => {
      setCurrentProject(project);
      router.push(`/projects/${project.id}`);
    },
    [router, setCurrentProject]
  );

  return {
    navigateToProject,
  };
}
