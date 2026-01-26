// Domain Entities
export { Routine, type RoutineId, type RoutineStatus, type RoutineType, type RoutineProps } from './domain/entities/Routine';
export { RoutineTask, type RoutineTaskId, type RoutineTaskProps } from './domain/entities/RoutineTask';

// Domain Repositories
export { type RoutineRepository } from './domain/repositories/RoutineRepository';

// Domain Utils
export {
  validateSleepTarget,
  validateStepTarget,
  validateOtherTarget,
  validateRoutineTarget,
  getTargetPlaceholder,
  getTargetHelperText,
  formatTargetDisplay,
  formatRepeatInterval,
  formatActiveDays,
  type ValidationResult,
} from './domain/utils/routineValidation';

// Services
export { RoutineService, RoutineNotFoundError } from './services/RoutineService';

// Hooks
export {
  useRoutineListData,
  useRoutineModals,
  useRoutineActions,
  useRoutineDetail,
  useRoutineListScreen,
  type UseRoutineListDataReturn,
  type UseRoutineModalsReturn,
  type UseRoutineActionsReturn,
  type UseRoutineDetailReturn,
  type UseRoutineListScreenReturn,
} from './hooks';
