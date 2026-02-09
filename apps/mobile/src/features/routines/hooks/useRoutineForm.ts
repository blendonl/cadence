import { useState, useEffect, useCallback } from 'react';
import { RoutineType, RoutineDetailDto, RoutineUpdateRequestDto } from 'shared-types';
import { validateRoutineTarget } from '../utils/routineValidation';
import { DEFAULT_SLEEP_WINDOW, FIXED_DAILY_TYPES } from '../constants/routineConstants';

interface UseRoutineFormCreateConfig {
  mode: 'create';
  lockedType?: RoutineType;
  onSubmit: (
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ) => Promise<void>;
  onClose: () => void;
}

interface UseRoutineFormEditConfig {
  mode: 'edit';
  routine: RoutineDetailDto | null;
  onSubmit: (id: string, updates: RoutineUpdateRequestDto) => Promise<void>;
  onClose: () => void;
}

export type UseRoutineFormConfig = UseRoutineFormCreateConfig | UseRoutineFormEditConfig;

export interface RoutineFormValues {
  name: string;
  type: RoutineType;
  target: string;
  separateInto: number;
  repeatIntervalMinutes: number;
  activeDays: string[] | null;
}

export interface UseRoutineFormReturn {
  values: RoutineFormValues;
  errors: { general: string; target: string };
  loading: boolean;
  isFormValid: boolean;
  shouldAutoName: boolean;
  isFixedDaily: boolean;
  setField: <K extends keyof RoutineFormValues>(field: K, value: RoutineFormValues[K]) => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
}

const getDefaultTarget = (type: RoutineType): string => {
  if (type === 'SLEEP') return DEFAULT_SLEEP_WINDOW;
  return '';
};

export function useRoutineForm(config: UseRoutineFormConfig, visible: boolean): UseRoutineFormReturn {
  const isCreate = config.mode === 'create';
  const lockedType = isCreate ? config.lockedType : undefined;
  const routine = !isCreate ? config.routine : null;

  const shouldAutoName = isCreate && (lockedType === 'SLEEP' || lockedType === 'STEP');
  const autoName = lockedType === 'SLEEP' ? 'Sleep Routine' : lockedType === 'STEP' ? 'Steps Routine' : '';

  const [values, setValues] = useState<RoutineFormValues>({
    name: '',
    type: lockedType || 'OTHER',
    target: getDefaultTarget(lockedType || 'OTHER'),
    separateInto: 1,
    repeatIntervalMinutes: 1440,
    activeDays: null,
  });
  const [errors, setErrors] = useState({ general: '', target: '' });
  const [loading, setLoading] = useState(false);

  const isFixedDaily = FIXED_DAILY_TYPES.includes(values.type);

  useEffect(() => {
    if (!visible) return;

    if (isCreate) {
      const type = lockedType || 'OTHER';
      setValues({
        name: shouldAutoName ? autoName : '',
        type,
        target: getDefaultTarget(type),
        separateInto: 1,
        repeatIntervalMinutes: 1440,
        activeDays: null,
      });
    } else if (routine) {
      setValues({
        name: routine.name,
        type: routine.type,
        target: routine.target,
        separateInto: routine.separateInto,
        repeatIntervalMinutes: routine.repeatIntervalMinutes,
        activeDays: routine.activeDays,
      });
    }
    setErrors({ general: '', target: '' });
    setLoading(false);
  }, [visible, isCreate, routine, lockedType, shouldAutoName, autoName]);

  const setField = useCallback(<K extends keyof RoutineFormValues>(field: K, value: RoutineFormValues[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (field === 'target') setErrors(prev => ({ ...prev, target: '' }));
    if (field === 'name') setErrors(prev => ({ ...prev, general: '' }));
  }, []);

  const handleClose = useCallback(() => {
    setLoading(false);
    setErrors({ general: '', target: '' });
    config.onClose();
  }, [config]);

  const handleSubmit = useCallback(async () => {
    setErrors({ general: '', target: '' });

    const effectiveName = shouldAutoName ? autoName : values.name;

    if (!effectiveName.trim()) {
      setErrors(prev => ({ ...prev, general: 'Routine name is required' }));
      return;
    }

    if (!values.target.trim()) {
      setErrors(prev => ({ ...prev, target: 'Target is required' }));
      return;
    }

    const validation = validateRoutineTarget(values.type, values.target);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, target: validation.error || 'Invalid target' }));
      return;
    }

    if (values.separateInto < 1) {
      setErrors(prev => ({ ...prev, general: 'Separate Into must be at least 1' }));
      return;
    }

    if (!isFixedDaily && values.repeatIntervalMinutes < 1) {
      setErrors(prev => ({ ...prev, general: 'Repeat Interval must be at least 1 minute' }));
      return;
    }

    const effectiveRepeat = isFixedDaily ? 1440 : values.repeatIntervalMinutes;
    const effectiveDays = isFixedDaily ? undefined : (values.activeDays || undefined);

    setLoading(true);
    try {
      if (isCreate) {
        const createConfig = config as UseRoutineFormCreateConfig;
        await createConfig.onSubmit(
          effectiveName,
          values.type,
          values.target,
          values.type === 'STEP' ? values.separateInto : undefined,
          effectiveRepeat,
          effectiveDays
        );
      } else {
        const editConfig = config as UseRoutineFormEditConfig;
        if (!editConfig.routine) return;
        const updates: RoutineUpdateRequestDto = {
          name: values.name,
          target: values.target,
          repeatIntervalMinutes: effectiveRepeat,
          activeDays: effectiveDays,
        };
        if (editConfig.routine.type === 'STEP') {
          updates.separateInto = values.separateInto;
        }
        await editConfig.onSubmit(editConfig.routine.id, updates);
      }
      handleClose();
    } catch (err) {
      const action = isCreate ? 'create' : 'update';
      setErrors(prev => ({
        ...prev,
        general: err instanceof Error ? err.message : `Failed to ${action} routine`,
      }));
    } finally {
      setLoading(false);
    }
  }, [values, shouldAutoName, autoName, isCreate, isFixedDaily, config, handleClose]);

  const isFormValid = (shouldAutoName || values.name.trim() !== '') && values.target.trim() !== '' && !loading;

  return {
    values,
    errors,
    loading,
    isFormValid,
    shouldAutoName,
    isFixedDaily,
    setField,
    handleSubmit,
    handleClose,
  };
}
