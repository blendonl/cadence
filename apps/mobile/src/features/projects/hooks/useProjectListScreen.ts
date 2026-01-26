import { useProjectListData } from './useProjectListData';
import { useProjectListModals } from './useProjectListModals';
import { useProjectListNavigation } from './useProjectListNavigation';
import { useProjectActions } from './useProjectActions';
import { Project } from '../domain/entities/Project';

export interface UseProjectListScreenReturn {
  viewState: {
    projects: Project[];
    loading: boolean;
    hasMore: boolean;
  };
  modals: {
    showCreateModal: boolean;
    openCreateModal: () => void;
    closeCreateModal: () => void;
  };
  navigation: {
    navigateToProject: (project: Project) => void;
  };
  actions: {
    handleCreateProject: (
      name: string,
      description: string,
      color: string
    ) => Promise<void>;
    handleDeleteProject: (projectId: string) => Promise<void>;
    handleArchiveProject: (projectId: string) => Promise<void>;
  };
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useProjectListScreen(): UseProjectListScreenReturn {
  const data = useProjectListData();
  const modals = useProjectListModals();
  const navigation = useProjectListNavigation();
  const actions = useProjectActions({
    refreshProjects: data.refresh,
    closeModal: modals.closeCreateModal,
  });

  return {
    viewState: {
      projects: data.projects,
      loading: data.loading,
      hasMore: data.hasMore,
    },
    modals,
    navigation,
    actions,
    refresh: data.refresh,
    loadMore: data.loadMore,
  };
}
