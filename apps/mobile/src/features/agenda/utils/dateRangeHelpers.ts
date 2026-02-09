import { formatDateKey, getMonday } from '@shared/utils/date.utils';

export interface DateRange {
  start: string;
  end: string;
}

export interface MonthGridRange extends DateRange {
  days: string[];
}

export interface NavigationDates {
  previous: string;
  next: string;
  today: string;
}

const toLocalDate = (dateKey: string): Date => new Date(`${dateKey}T00:00:00`);

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getWeekRange = (anchorDate: string): DateRange => {
  const date = toLocalDate(anchorDate);
  const monday = getMonday(date);
  const sunday = addDays(monday, 6);
  return {
    start: formatDateKey(monday),
    end: formatDateKey(sunday),
  };
};

export const getMonthGridRange = (anchorDate: string): MonthGridRange => {
  const date = toLocalDate(anchorDate);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const gridStart = getMonday(monthStart);
  const gridEndBase = new Date(monthEnd);
  const gridEndDay = gridEndBase.getDay();
  const gridEnd = gridEndDay === 0 ? gridEndBase : addDays(gridEndBase, 7 - gridEndDay);

  const days: string[] = [];
  let current = new Date(gridStart);
  while (current <= gridEnd) {
    days.push(formatDateKey(current));
    current = addDays(current, 1);
  }

  return {
    start: formatDateKey(gridStart),
    end: formatDateKey(gridEnd),
    days,
  };
};

export const getWeekdayLabels = (): string[] => {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
};

export const formatDayLabel = (dateKey: string): string => {
  const date = toLocalDate(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatWeekLabel = (start: string, end: string): string => {
  const startDate = toLocalDate(start);
  const endDate = toLocalDate(end);

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const year = endDate.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
};

export const formatMonthLabel = (anchorDate: string): string => {
  const date = toLocalDate(anchorDate);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const getNavigationDates = (
  mode: 'day' | 'week' | 'month',
  anchorDate: string,
): NavigationDates => {
  const date = toLocalDate(anchorDate);
  const today = formatDateKey(new Date());

  switch (mode) {
    case 'day':
      return {
        previous: formatDateKey(addDays(date, -1)),
        next: formatDateKey(addDays(date, 1)),
        today,
      };
    case 'week': {
      const monday = getMonday(date);
      return {
        previous: formatDateKey(addDays(monday, -7)),
        next: formatDateKey(addDays(monday, 7)),
        today,
      };
    }
    case 'month': {
      const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      return {
        previous: formatDateKey(prevMonth),
        next: formatDateKey(nextMonth),
        today,
      };
    }
  }
};

export const getViewLabel = (
  mode: 'day' | 'week' | 'month',
  anchorDate: string,
): string => {
  switch (mode) {
    case 'day':
      return formatDayLabel(anchorDate);
    case 'week': {
      const range = getWeekRange(anchorDate);
      return formatWeekLabel(range.start, range.end);
    }
    case 'month':
      return formatMonthLabel(anchorDate);
  }
};

export const getDateRange = (
  mode: 'day' | 'week' | 'month',
  anchorDate: string,
): DateRange => {
  switch (mode) {
    case 'day':
      return { start: anchorDate, end: anchorDate };
    case 'week':
      return getWeekRange(anchorDate);
    case 'month': {
      const grid = getMonthGridRange(anchorDate);
      return { start: grid.start, end: grid.end };
    }
  }
};

export const isDateToday = (dateKey: string): boolean => {
  return dateKey === formatDateKey(new Date());
};

export const isDateInMonth = (dateKey: string, anchorDate: string): boolean => {
  const date = toLocalDate(dateKey);
  const anchor = toLocalDate(anchorDate);
  return date.getMonth() === anchor.getMonth() && date.getFullYear() === anchor.getFullYear();
};

export const getDayOfMonth = (dateKey: string): string => {
  const date = toLocalDate(dateKey);
  return String(date.getDate());
};

export const getShortDayLabel = (dateKey: string): string => {
  const date = toLocalDate(dateKey);
  return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

export const getDayNumber = (dateKey: string): string => {
  const date = toLocalDate(dateKey);
  return String(date.getDate());
};
