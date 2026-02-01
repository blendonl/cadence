import { RoutineType } from 'shared-types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MAX_SLEEP_HOURS = 24;
const MIN_TARGET = 1;

const parseTargetNumber = (target: string): number | null => {
  const parsed = Number(target);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

export const validateSleepTarget = (target: string): ValidationResult => {
  const value = parseTargetNumber(target);
  if (value === null || value < MIN_TARGET) {
    return { valid: false, error: 'Sleep target must be a positive number' };
  }
  if (value > MAX_SLEEP_HOURS) {
    return { valid: false, error: `Sleep target cannot exceed ${MAX_SLEEP_HOURS} hours` };
  }
  return { valid: true };
};

export const validateStepTarget = (target: string): ValidationResult => {
  const value = parseTargetNumber(target);
  if (value === null || value < MIN_TARGET) {
    return { valid: false, error: 'Step target must be a positive number' };
  }
  return { valid: true };
};

export const validateOtherTarget = (target: string): ValidationResult => {
  const value = parseTargetNumber(target);
  if (value === null || value < MIN_TARGET) {
    return { valid: false, error: 'Target must be a positive number' };
  }
  return { valid: true };
};

export const validateRoutineTarget = (type: RoutineType, target: string): ValidationResult => {
  switch (type) {
    case 'SLEEP':
      return validateSleepTarget(target);
    case 'STEP':
      return validateStepTarget(target);
    case 'OTHER':
      return validateOtherTarget(target);
    default:
      return { valid: false, error: 'Invalid routine type' };
  }
};

export const getTargetPlaceholder = (type: RoutineType): string => {
  switch (type) {
    case 'SLEEP':
      return 'e.g., 8';
    case 'STEP':
      return 'e.g., 8000';
    case 'OTHER':
      return 'e.g., 30';
    default:
      return '';
  }
};

export const getTargetHelperText = (type: RoutineType): string => {
  switch (type) {
    case 'SLEEP':
      return 'Hours of sleep per day';
    case 'STEP':
      return 'Steps per day';
    case 'OTHER':
      return 'Numeric target value';
    default:
      return '';
  }
};

export const formatTargetDisplay = (type: RoutineType, target: string): string => {
  const trimmedTarget = target.trim();
  if (!trimmedTarget) {
    return 'No target';
  }

  switch (type) {
    case 'SLEEP':
      return `${trimmedTarget} hrs`;
    case 'STEP':
      return `${trimmedTarget} steps`;
    case 'OTHER':
      return trimmedTarget;
    default:
      return trimmedTarget;
  }
};

export const formatRepeatInterval = (repeatIntervalMinutes: number): string => {
  if (repeatIntervalMinutes <= 0) {
    return 'Not set';
  }
  if (repeatIntervalMinutes % 1440 === 0) {
    const days = repeatIntervalMinutes / 1440;
    return days === 1 ? 'Daily' : `Every ${days} days`;
  }
  if (repeatIntervalMinutes % 60 === 0) {
    const hours = repeatIntervalMinutes / 60;
    return hours === 1 ? 'Hourly' : `Every ${hours} hours`;
  }
  return `Every ${repeatIntervalMinutes} minutes`;
};

export const formatActiveDays = (activeDays: string[] | null | undefined): string => {
  if (!activeDays || activeDays.length === 0 || activeDays.length === 7) {
    return 'Every day';
  }

  const order = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const labels: Record<string, string> = {
    MON: 'Mon',
    TUE: 'Tue',
    WED: 'Wed',
    THU: 'Thu',
    FRI: 'Fri',
    SAT: 'Sat',
    SUN: 'Sun',
  };

  return order
    .filter((day) => activeDays.includes(day))
    .map((day) => labels[day])
    .join(', ');
};
