import { useState, useCallback } from 'react';
import { getMonday, getMonthStart } from '@shared/utils/date.utils';
import { ViewMode } from '../types/agenda-screen.types';

export function useAgendaNavigation() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(getMonthStart(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const goToPreviousWeek = useCallback(() => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
    setSelectedDate(prev);
  }, [weekStart]);

  const goToNextWeek = useCallback(() => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
    setSelectedDate(next);
  }, [weekStart]);

  const goToPreviousMonth = useCallback(() => {
    const prev = new Date(monthAnchor);
    prev.setMonth(prev.getMonth() - 1);
    setMonthAnchor(getMonthStart(prev));
    setSelectedDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
  }, [monthAnchor]);

  const goToNextMonth = useCallback(() => {
    const next = new Date(monthAnchor);
    next.setMonth(next.getMonth() + 1);
    setMonthAnchor(getMonthStart(next));
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
  }, [monthAnchor]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setWeekStart(getMonday(today));
    setMonthAnchor(getMonthStart(today));
    setSelectedDate(today);
  }, []);

  const toggleViewMode = useCallback(() => {
    if (viewMode === 'week') {
      setViewMode('month');
      setMonthAnchor(getMonthStart(selectedDate));
    } else {
      setViewMode('week');
      setWeekStart(getMonday(selectedDate));
    }
  }, [viewMode, selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    weekStart,
    monthAnchor,
    setMonthAnchor,
    viewMode,
    goToPreviousWeek,
    goToNextWeek,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    toggleViewMode,
  };
}
