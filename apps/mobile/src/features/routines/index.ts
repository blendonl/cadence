// Constants
export {
  ROUTINE_TYPE_BADGE_CONFIG,
  REPEAT_INTERVAL_PRESETS,
  STEP_TARGET_PRESETS,
  DEFAULT_SLEEP_WINDOW,
  SEPARATE_INTO_RANGE,
  FIXED_DAILY_TYPES,
  type RepeatIntervalPreset,
} from './constants/routineConstants';

// Utils
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
} from './utils/routineValidation';

// Hooks
export {
  useRoutineListData,
  useRoutineModals,
  useRoutineActions,
  useRoutineDetail,
  useRoutineListScreen,
  useRoutineForm,
  type UseRoutineListDataReturn,
  type UseRoutineModalsReturn,
  type UseRoutineActionsReturn,
  type UseRoutineDetailReturn,
  type UseRoutineListScreenReturn,
  type UseRoutineFormConfig,
  type UseRoutineFormReturn,
  type RoutineFormValues,
} from './hooks';
