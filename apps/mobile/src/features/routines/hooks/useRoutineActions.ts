import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { getRoutineService } from '@core/di/hooks';
import alertService from '@/services/AlertService';
import { logger } from '@utils/logger';
import { RoutineType, RoutineProps } from '../domain/entities/Routine';

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
  handleUpdateRoutine: (id: string, updates: Partial<RoutineProps>) => Promise<void>;
  handleDeleteRoutine: (id: string) => Promise<void>;
  handleToggleStatus: (id: string, currentStatus: string) => Promise<void>;
}

export function useRoutineActions({
  refreshRoutines,
  closeModal,
}: UseRoutineActionsProps): UseRoutineActionsReturn {
  const routineService = getRoutineService();

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
        await routineService.createRoutine(name, type, target, {
          separateInto,
          repeatIntervalMinutes,
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
    [routineService, refreshRoutines, closeModal]
  );

  const handleUpdateRoutine = useCallback(
    async (id: string, updates: Partial<RoutineProps>) => {
      try {
        await routineService.updateRoutine(id, updates);

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
    [routineService, refreshRoutines, closeModal]
  );

  const handleDeleteRoutine = useCallback(
    async (id: string) => {
      try {
        await routineService.deleteRoutine(id);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
      } catch (error) {
        logger.error('Failed to delete routine', error, { id });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to delete routine. Please try again.');
      }
    },
    [routineService, refreshRoutines]
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: string) => {
      try {
        if (currentStatus === 'ACTIVE') {
          await routineService.disableRoutine(id);
        } else {
          await routineService.enableRoutine(id);
        }

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshRoutines();
      } catch (error) {
        logger.error('Failed to toggle routine status', error, { id, currentStatus });

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alertService.showError('Failed to update routine status. Please try again.');
      }
    },
    [routineService, refreshRoutines]
  );

  return {
    handleCreateRoutine,
    handleUpdateRoutine,
    handleDeleteRoutine,
    handleToggleStatus,
  };
}
