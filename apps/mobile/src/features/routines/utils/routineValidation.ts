import { RoutineType } from 'shared-types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const MIN_TARGET = 1;

const parseTargetNumber = (target: string): number | null => {
  const parsed = Number(target);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
};

const SLEEP_WINDOW_REGEX = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/;

export const validateSleepTarget = (target: string): ValidationResult => {
  const match = target.match(SLEEP_WINDOW_REGEX);
  if (!match) {
    return { valid: false, error: 'Sleep target must be in format HH:MM-HH:MM (e.g. 23:00-07:00)' };
  }
  const bedH = parseInt(match[1], 10);
  const bedM = parseInt(match[2], 10);
  const wakeH = parseInt(match[3], 10);
  const wakeM = parseInt(match[4], 10);
  if (bedH > 23 || bedM > 59 || wakeH > 23 || wakeM > 59) {
    return { valid: false, error: 'Invalid time values' };
  }
  if (bedH === wakeH && bedM === wakeM) {
    return { valid: false, error: 'Bedtime and wake time cannot be the same' };
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
      return 'e.g., 23:00-07:00';
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
      return 'Sleep window (bedtime - wake time)';
    case 'STEP':
      return 'Steps per day';
    case 'OTHER':
      return 'Numeric target value';
    default:
      return '';
  }
};

const formatTime12h = (hour: number, min: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
};

export const formatTargetDisplay = (type: RoutineType, target: string): string => {
  const trimmedTarget = target.trim();
  if (!trimmedTarget) {
    return 'No target';
  }

  switch (type) {
    case 'SLEEP': {
      const match = trimmedTarget.match(SLEEP_WINDOW_REGEX);
      if (match) {
        const bedH = parseInt(match[1], 10);
        const bedM = parseInt(match[2], 10);
        const wakeH = parseInt(match[3], 10);
        const wakeM = parseInt(match[4], 10);
        return `${formatTime12h(bedH, bedM)} - ${formatTime12h(wakeH, wakeM)}`;
      }
      return trimmedTarget;
    }
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
