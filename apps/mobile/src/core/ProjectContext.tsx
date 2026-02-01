import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ProjectDto } from 'shared-types';
import { projectApi } from '@features/projects/api/projectApi';

interface ProjectContextValue {
  currentProject: ProjectDto | null;
  setCurrentProject: (project: ProjectDto | null) => void;
  projects: ProjectDto[];
  loadProjects: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [currentProject, setCurrentProject] = useState<ProjectDto | null>(null);
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await projectApi.getProjects({ page: 1, limit: 50 });
      setProjects(result.items);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  const value: ProjectContextValue = {
    currentProject,
    setCurrentProject,
    projects,
    loadProjects,
    refreshProjects,
    isLoading,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}

export function useCurrentProject(): ProjectDto | null {
  const { currentProject } = useProjectContext();
  return currentProject;
}
