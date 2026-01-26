import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { getProjectService } from '@core/di/hooks';
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
  const projectService = getProjectService();

  const handleCreateProject = useCallback(
    async (name: string, description: string, color: string) => {
      try {
        await projectService.createProject(name, description, color);

        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Refresh the projects list
        await refreshProjects();

        // Close the modal
        closeModal();
      } catch (error) {
        logger.error('Failed to create project', error, {
          name,
          description,
          color,
        });

        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Show error alert
        alertService.showError('Failed to create project. Please try again.');
      }
    },
    [projectService, refreshProjects, closeModal]
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      try {
        await projectService.deleteProject(projectId);

        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Refresh the projects list
        await refreshProjects();
      } catch (error) {
        logger.error('Failed to delete project', error, { projectId });

        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Show error alert
        alertService.showError('Failed to delete project. Please try again.');
      }
    },
    [projectService, refreshProjects]
  );

  const handleArchiveProject = useCallback(
    async (projectId: string) => {
      try {
        // Assuming there's an archive method - if not, this can be implemented later
        // await projectService.archiveProject(projectId);

        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Refresh the projects list
        await refreshProjects();
      } catch (error) {
        logger.error('Failed to archive project', error, { projectId });

        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        // Show error alert
        alertService.showError('Failed to archive project. Please try again.');
      }
    },
    [projectService, refreshProjects]
  );

  return {
    handleCreateProject,
    handleDeleteProject,
    handleArchiveProject,
  };
}
