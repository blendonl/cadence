import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { projectApi } from '../api/projectApi';
import alertService from '@/services/AlertService';
import logger from '@/utils/logger';

interface UseProjectActionsProps {
  refreshProjects: () => Promise<void>;
  closeModal: () => void;
}

export interface UseProjectActionsReturn {
  handleCreateProject: (
    name: string,
    description: string,
    color: string
  ) => Promise<void>;
  handleDeleteProject: (projectId: string) => Promise<void>;
  handleArchiveProject: (projectId: string) => Promise<void>;
}

export function useProjectActions({
  refreshProjects,
  closeModal,
}: UseProjectActionsProps): UseProjectActionsReturn {
  const handleCreateProject = useCallback(
    async (name: string, description: string, color: string) => {
      try {
        await projectApi.createProject({ name, description, color });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshProjects();
        closeModal();
      } catch (error) {
        logger.error('Failed to create project', error, {
          name,
          description,
          color,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to create project. Please try again.');
      }
    },
    [refreshProjects, closeModal]
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      try {
        await projectApi.deleteProject(projectId);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshProjects();
      } catch (error) {
        logger.error('Failed to delete project', error, { projectId });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to delete project. Please try again.');
      }
    },
    [refreshProjects]
  );

  const handleArchiveProject = useCallback(
    async (projectId: string) => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshProjects();
      } catch (error) {
        logger.error('Failed to archive project', error, { projectId });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to archive project. Please try again.');
      }
    },
    [refreshProjects]
  );

  return {
    handleCreateProject,
    handleDeleteProject,
    handleArchiveProject,
  };
}
