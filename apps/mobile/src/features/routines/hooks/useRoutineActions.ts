import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { routineApi } from '../api/routineApi';
import alertService from '@/services/AlertService';
import { logger } from '@utils/logger';
import { RoutineType, RoutineUpdateRequestDto } from 'shared-types';

interface UseRoutineActionsProps {
  refreshRoutines: () => Promise<void>;
  closeModal: () => void;
}

export interface UseRoutineActionsReturn {
  handleCreateRoutine: (
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ) => Promise<void>;
  handleUpdateRoutine: (id: string, updates: RoutineUpdateRequestDto) => Promise<void>;
  handleDeleteRoutine: (id: string) => Promise<void>;
  handleToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export function useRoutineActions({
  refreshRoutines,
  closeModal,
}: UseRoutineActionsProps): UseRoutineActionsReturn {
  const handleCreateRoutine = useCallback(
    async (
      name: string,
      type: RoutineType,
      target: string,
      separateInto?: number,
      repeatIntervalMinutes?: number,
      activeDays?: string[]
    ) => {
      try {
        const repeatInterval = repeatIntervalMinutes ?? 1440;
        await routineApi.createRoutine({
          name,
          type,
          target,
          separateInto,
          repeatIntervalMinutes: repeatInterval,
          activeDays,
        });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
        closeModal();
      } catch (error) {
        logger.error('Failed to create routine', error, { name, type, target });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create routine. Please try again.';
        alertService.showError(errorMessage);
      }
    },
    [refreshRoutines, closeModal]
  );

  const handleUpdateRoutine = useCallback(
    async (id: string, updates: RoutineUpdateRequestDto) => {
      try {
        await routineApi.updateRoutine(id, updates);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
        closeModal();
      } catch (error) {
        logger.error('Failed to update routine', error, { id, updates });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update routine. Please try again.';
        alertService.showError(errorMessage);
      }
    },
    [refreshRoutines, closeModal]
  );

  const handleDeleteRoutine = useCallback(
    async (id: string) => {
      try {
        await routineApi.deleteRoutine(id);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
      } catch (error) {
        logger.error('Failed to delete routine', error, { id });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to delete routine. Please try again.');
      }
    },
    [refreshRoutines]
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        const status = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        await routineApi.updateRoutine(id, { status });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
      } catch (error) {
        logger.error('Failed to toggle routine status', error, { id, currentStatus });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to update routine status. Please try again.');
      }
    },
    [refreshRoutines]
  );

  return {
    handleCreateRoutine,
    handleUpdateRoutine,
    handleDeleteRoutine,
    handleToggleStatus,
  };
}
