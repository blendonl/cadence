import { TaskScheduleData } from '../components/TaskScheduleModal';

export const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(`${dateString}T00:00:00`);
  if (isNaN(date.getTime())) return false;

  const minDate = new Date('2020-01-01');
  if (date < minDate) return false;

  return true;
};

export const validateTime = (timeString: string): boolean => {
  if (timeString === '') return true;
  if (!timeString) return false;

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeString);
};

export const validateDuration = (minutes: number | undefined): boolean => {
  if (minutes === undefined) return true;
  return Number.isInteger(minutes) && minutes > 0;
};

export const getValidationErrors = (data: TaskScheduleData): string[] => {
  const errors: string[] = [];

  if (!validateDate(data.date)) {
    errors.push('Invalid date format. Use YYYY-MM-DD.');
  }

  if (data.isAllDay) {
    if (data.time) {
      errors.push('All-day tasks cannot have a time.');
    }
    if (data.durationMinutes) {
      errors.push('All-day tasks cannot have a duration.');
    }
  } else {
    if (data.time && !validateTime(data.time)) {
      errors.push('Invalid time format. Use HH:MM (24-hour).');
    }
    if (data.durationMinutes && !validateDuration(data.durationMinutes)) {
      errors.push('Duration must be a positive number.');
    }
  }

  return errors;
};
