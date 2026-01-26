import { RoutineType } from "../entities/Routine";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const SLEEP_TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

export function validateSleepTarget(target: string): ValidationResult {
  if (!target || target.trim() === "") {
    return {
      valid: false,
      error: "Sleep time is required",
    };
  }

  if (!SLEEP_TIME_REGEX.test(target)) {
    return {
      valid: false,
      error: "Sleep time must be in format HH:MM-HH:MM (e.g., 23:00-07:00)",
    };
  }

  return { valid: true };
}

export function validateStepTarget(target: string): ValidationResult {
  if (!target || target.trim() === "") {
    return {
      valid: false,
      error: "Step target is required",
    };
  }

  const numValue = parseInt(target, 10);

  if (isNaN(numValue)) {
    return {
      valid: false,
      error: "Step target must be a number",
    };
  }

  if (numValue < 1 || numValue > 100000) {
    return {
      valid: false,
      error: "Step target must be between 1 and 100,000",
    };
  }

  return { valid: true };
}

export function validateOtherTarget(target: string): ValidationResult {
  if (!target || target.trim() === "") {
    return {
      valid: false,
      error: "Target is required",
    };
  }

  if (target.length > 500) {
    return {
      valid: false,
      error: "Target must be 500 characters or less",
    };
  }

  return { valid: true };
}

export function validateRoutineTarget(type: RoutineType, target: string): ValidationResult {
  switch (type) {
    case "SLEEP":
      return validateSleepTarget(target);
    case "STEP":
      return validateStepTarget(target);
    case "OTHER":
      return validateOtherTarget(target);
    default:
      return {
        valid: false,
        error: "Invalid routine type",
      };
  }
}

export function getTargetPlaceholder(type: RoutineType): string {
  switch (type) {
    case "SLEEP":
      return "e.g., 23:00-07:00";
    case "STEP":
      return "e.g., 10000";
    case "OTHER":
      return "e.g., Drink 8 glasses of water";
    default:
      return "";
  }
}

export function getTargetHelperText(type: RoutineType): string {
  switch (type) {
    case "SLEEP":
      return "Enter sleep time in 24-hour format (HH:MM-HH:MM)";
    case "STEP":
      return "Enter daily step goal (1-100,000)";
    case "OTHER":
      return "Enter your custom routine target";
    default:
      return "";
  }
}

export function formatTargetDisplay(type: RoutineType, target: string): string {
  switch (type) {
    case "SLEEP":
      return target;
    case "STEP":
      const numValue = parseInt(target, 10);
      if (!isNaN(numValue)) {
        return numValue.toLocaleString() + " steps";
      }
      return target;
    case "OTHER":
      if (target.length > 30) {
        return target.substring(0, 27) + "...";
      }
      return target;
    default:
      return target;
  }
}

export function formatRepeatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes === 1440) {
    return "1d";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatActiveDays(activeDays: string[] | null): string {
  if (!activeDays || activeDays.length === 7) {
    return "Every day";
  }

  const weekdays = ["MON", "TUE", "WED", "THU", "FRI"];
  const weekends = ["SAT", "SUN"];

  const isWeekdays = weekdays.every(day => activeDays.includes(day)) &&
                     weekends.every(day => !activeDays.includes(day));
  const isWeekends = weekends.every(day => activeDays.includes(day)) &&
                     weekdays.every(day => !activeDays.includes(day));

  if (isWeekdays) {
    return "Weekdays";
  }

  if (isWeekends) {
    return "Weekends";
  }

  const dayAbbreviations: Record<string, string> = {
    MON: "M",
    TUE: "T",
    WED: "W",
    THU: "Th",
    FRI: "F",
    SAT: "Sa",
    SUN: "Su",
  };

  return activeDays.map(day => dayAbbreviations[day] || day).join(", ");
}
