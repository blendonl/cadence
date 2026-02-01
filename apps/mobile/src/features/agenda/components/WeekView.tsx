import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { AgendaEnrichedDto } from 'shared-types';
import { isToday, isSelected, formatDateKey } from '@shared/utils/date.utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeekViewProps {
  weekStart: Date;
  selectedDate: Date;
  agendaData: AgendaEnrichedDto[];
  onDateSelect: (date: Date) => void;
}

export function WeekView({
  weekStart,
  selectedDate,
  agendaData,
  onDateSelect,
}: WeekViewProps) {
  const weekDays = useMemo((): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const getItemCount = (date: Date): number => {
    const dateStr = formatDateKey(date);
    const dayAgenda = agendaData.find(d => d.date === dateStr);
    if (!dayAgenda) return 0;
    const sleepCount =
      (dayAgenda.sleep.sleep ? 1 : 0) + (dayAgenda.sleep.wakeup ? 1 : 0);
    return (
      sleepCount
      + dayAgenda.steps.length
      + dayAgenda.routines.length
      + dayAgenda.tasks.length
    );
  };

  return (
    <View style={styles.daysRow}>
      {weekDays.map((date, index) => {
        const itemCount = getItemCount(date);
        const hasItems = itemCount > 0;
        const isTodayDate = isToday(date);
        const isSelectedDate = isSelected(date, selectedDate);

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              isSelectedDate && styles.dayCellSelected,
              isTodayDate && styles.dayCellToday,
            ]}
            onPress={() => onDateSelect(date)}
          >
            <Text style={[
              styles.dayName,
              isSelectedDate && styles.dayNameSelected,
            ]}>
              {DAYS[index]}
            </Text>
            <Text style={[
              styles.dayNumber,
              isSelectedDate && styles.dayNumberSelected,
              isTodayDate && !isSelectedDate && styles.dayNumberToday,
            ]}>
              {date.getDate()}
            </Text>
            {hasItems && (
              <View style={[styles.dayCount, isSelectedDate && styles.dayCountSelected]}>
                <Text style={[styles.dayCountText, isSelectedDate && styles.dayCountTextSelected]}>
                  {itemCount > 9 ? '9+' : itemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dayCell: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
    minWidth: 44,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  dayCellSelected: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  dayCellToday: {
    borderColor: theme.accent.primary,
  },
  dayName: {
    color: theme.text.secondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: theme.background.primary,
  },
  dayNumber: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: theme.background.primary,
  },
  dayNumberToday: {
    color: theme.text.primary,
  },
  dayCount: {
    marginTop: spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: theme.background.primary,
  },
  dayCountSelected: {
    backgroundColor: theme.background.primary,
  },
  dayCountText: {
    fontSize: 10,
    color: theme.text.secondary,
    fontWeight: '700',
  },
  dayCountTextSelected: {
    color: theme.text.primary,
  },
});
