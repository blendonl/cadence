import { useMemo } from 'react';
import {
  AgendaDayHourSlotDto,
  AgendaItemEnrichedDto,
  AgendaItemsDayDto,
  AgendaItemsSleepDto,
  AgendaViewMode,
} from 'shared-types';
import { separateAllDayItems, groupItemsByHour, calculateTimelineHours } from '../utils/timelineHelpers';
import { getScheduledTime, getDurationMinutes } from '../utils/agendaHelpers';
import { isDateToday, isDateInMonth, getDayOfMonth, getShortDayLabel } from '../utils/dateRangeHelpers';
import { assignOverlapLayout, TimedItemLayoutInput } from '../utils/overlapLayout';
import { safeParseHour } from '../utils/timelineValidation';

export interface ProcessedDayData {
  dateKey: string;
  isToday: boolean;
  sleep: AgendaItemsSleepDto;
  allDayItems: AgendaItemEnrichedDto[];
  timedItems: AgendaItemEnrichedDto[];
  unfinishedItems: AgendaItemEnrichedDto[];
  steps: AgendaItemEnrichedDto[];
  routines: AgendaItemEnrichedDto[];
}

export interface DayViewData {
  hours: AgendaDayHourSlotDto[];
  allDayItems: AgendaItemEnrichedDto[];
  wakeup: AgendaItemEnrichedDto | null;
  sleepItem: AgendaItemEnrichedDto | null;
  step: AgendaItemEnrichedDto | null;
  wakeUpHour: number | null;
  sleepHour: number | null;
  isEmpty: boolean;
  isToday: boolean;
  unfinishedItems: AgendaItemEnrichedDto[];
}

export interface WeekDayData {
  dateKey: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
  allDayItems: AgendaItemEnrichedDto[];
  timedItems: {
    item: AgendaItemEnrichedDto;
    startMinute: number;
    durationMinutes: number;
    overlapIndex: number;
    overlapCount: number;
  }[];
}

export interface MonthDayData {
  dateKey: string;
  label: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  items: AgendaItemEnrichedDto[];
  overflowCount: number;
}

const MAX_MONTH_ITEMS = 3;
const DEFAULT_DURATION = 30;

const getAllItems = (day: AgendaItemsDayDto): AgendaItemEnrichedDto[] => {
  return [...day.tasks, ...day.routines];
};

const processDayRaw = (day: AgendaItemsDayDto): ProcessedDayData => {
  const allItems = getAllItems(day);
  const { allDay, timed } = separateAllDayItems(allItems);

  return {
    dateKey: day.date,
    isToday: isDateToday(day.date),
    sleep: day.sleep,
    allDayItems: allDay,
    timedItems: timed,
    unfinishedItems: day.unfinished,
    steps: day.steps,
    routines: day.routines,
  };
};

const buildHourSlots = (
  timedItems: AgendaItemEnrichedDto[],
): AgendaDayHourSlotDto[] => {
  const grouped = groupItemsByHour(timedItems);
  const hours = calculateTimelineHours('00:00', '23:00', false);

  return hours.map((h) => ({
    hour: h.hour,
    label: h.label,
    items: grouped.get(h.hour) || [],
  }));
};

const parseHourFromStartAt = (startAt: string | null): number | null => {
  if (!startAt) return null;
  const timePart = startAt.split('T')[1];
  if (!timePart) return null;
  return safeParseHour(timePart.substring(0, 5));
};

const buildTimedItemLayouts = (timedItems: AgendaItemEnrichedDto[]) => {
  const inputs: TimedItemLayoutInput[] = timedItems
    .filter((item) => item.startAt)
    .map((item) => {
      const time = getScheduledTime(item);
      const parts = time?.split(':') ?? ['0', '0'];
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      return {
        item,
        startMinute: hour * 60 + minute,
        durationMinutes: getDurationMinutes(item) ?? DEFAULT_DURATION,
      };
    });

  return assignOverlapLayout(inputs);
};

export const useProcessedAgendaData = (
  rawDays: AgendaItemsDayDto[] | null,
  viewMode: AgendaViewMode,
  anchorDate: string,
) => {
  const processedDays = useMemo(() => {
    if (!rawDays) return null;
    return rawDays.map(processDayRaw);
  }, [rawDays]);

  const dayViewData = useMemo((): DayViewData | null => {
    if (viewMode !== 'day' || !processedDays || processedDays.length === 0) return null;
    const day = processedDays[0];
    const hours = buildHourSlots(day.timedItems);

    return {
      hours,
      allDayItems: day.allDayItems,
      wakeup: day.sleep.wakeup,
      sleepItem: day.sleep.sleep,
      step: day.steps[0] ?? null,
      wakeUpHour: parseHourFromStartAt(day.sleep.wakeup?.startAt ?? null),
      sleepHour: parseHourFromStartAt(day.sleep.sleep?.startAt ?? null),
      isEmpty: day.allDayItems.length === 0 && day.timedItems.length === 0 && day.steps.length === 0,
      isToday: day.isToday,
      unfinishedItems: day.unfinishedItems,
    };
  }, [viewMode, processedDays]);

  const weekViewData = useMemo((): WeekDayData[] | null => {
    if (viewMode !== 'week' || !processedDays) return null;
    return processedDays.map((day) => ({
      dateKey: day.dateKey,
      label: getDayOfMonth(day.dateKey),
      shortLabel: getShortDayLabel(day.dateKey),
      isToday: day.isToday,
      allDayItems: day.allDayItems,
      timedItems: buildTimedItemLayouts(day.timedItems),
    }));
  }, [viewMode, processedDays]);

  const monthViewData = useMemo((): MonthDayData[] | null => {
    if (viewMode !== 'month' || !processedDays) return null;
    return processedDays.map((day) => {
      const allItems = [...day.allDayItems, ...day.timedItems];
      const visibleItems = allItems.slice(0, MAX_MONTH_ITEMS);
      const overflowCount = Math.max(0, allItems.length - MAX_MONTH_ITEMS);

      return {
        dateKey: day.dateKey,
        label: getDayOfMonth(day.dateKey),
        isToday: day.isToday,
        isCurrentMonth: isDateInMonth(day.dateKey, anchorDate),
        items: visibleItems,
        overflowCount,
      };
    });
  }, [viewMode, processedDays, anchorDate]);

  const unfinishedItems = useMemo(() => {
    if (!processedDays) return [];
    const allUnfinished: AgendaItemEnrichedDto[] = [];
    const seen = new Set<string>();
    processedDays.forEach((day) => {
      day.unfinishedItems.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          allUnfinished.push(item);
        }
      });
    });
    return allUnfinished;
  }, [processedDays]);

  return {
    processedDays,
    dayViewData,
    weekViewData,
    monthViewData,
    unfinishedItems,
  };
};
