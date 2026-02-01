import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { AgendaEnrichedDto } from 'shared-types';
import { isToday, isSelected, formatDateKey, getMonday, getMonthStart } from '@shared/utils/date.utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface MonthViewProps {
  monthAnchor: Date;
  selectedDate: Date;
  agendaData: AgendaEnrichedDto[];
  loading: boolean;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function MonthView({
  monthAnchor,
  selectedDate,
  agendaData,
  loading,
  onDateSelect,
  onMonthChange,
}: MonthViewProps) {
  const monthGridDays = useMemo((): Date[] => {
    const start = getMonthStart(monthAnchor);
    const gridStart = getMonday(start);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [monthAnchor]);

  const getItemCount = (date: Date): number => {
    const dateKey = formatDateKey(date);
    const dayAgenda = agendaData.find(d => d.date === dateKey);
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
    <View style={styles.monthGridContainer}>
      <View style={styles.monthWeekdayRow}>
        {DAYS.map(day => (
          <Text key={day} style={styles.monthWeekdayText}>{day}</Text>
        ))}
      </View>
      {loading ? (
        <View style={styles.monthLoading}>
          <ActivityIndicator size="small" color={theme.accent.primary} />
          <Text style={styles.monthLoadingText}>Loading month...</Text>
        </View>
      ) : (
        <View style={styles.monthGrid}>
          {monthGridDays.map((date, index) => {
            const dateKey = formatDateKey(date);
            const itemCount = getItemCount(date);
            const isOutside = date.getMonth() !== monthAnchor.getMonth();
            const isTodayDate = isToday(date);
            const isSelectedDate = isSelected(date, selectedDate);

            return (
              <TouchableOpacity
                key={`${dateKey}-${index}`}
                style={[
                  styles.monthDayCell,
                  isOutside && styles.monthDayCellOutside,
                  isSelectedDate && styles.monthDayCellSelected,
                  isTodayDate && styles.monthDayCellToday,
                ]}
                onPress={() => {
                  onDateSelect(date);
                  if (isOutside) {
                    onMonthChange(date);
                  }
                }}
              >
                <Text style={[
                  styles.monthDayNumber,
                  isOutside && styles.monthDayNumberOutside,
                  isSelectedDate && styles.monthDayNumberSelected,
                ]}>
                  {date.getDate()}
                </Text>
                {itemCount > 0 && (
                  <View style={[
                    styles.monthDayBadge,
                    isSelectedDate && styles.monthDayBadgeSelected,
                  ]}>
                    <Text style={[
                      styles.monthDayBadgeText,
                      isSelectedDate && styles.monthDayBadgeTextSelected,
                    ]}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  monthGridContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  monthWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  monthWeekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    color: theme.text.muted,
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginVertical: 2,
  },
  monthDayCellOutside: {
    opacity: 0.4,
  },
  monthDayCellSelected: {
    backgroundColor: theme.accent.primary,
  },
  monthDayCellToday: {
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  monthDayNumber: {
    color: theme.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  monthDayNumberOutside: {
    color: theme.text.muted,
  },
  monthDayNumberSelected: {
    color: theme.background.primary,
  },
  monthDayBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  monthDayBadgeSelected: {
    backgroundColor: theme.background.primary,
    borderColor: theme.background.primary,
  },
  monthDayBadgeText: {
    fontSize: 10,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  monthDayBadgeTextSelected: {
    color: theme.text.primary,
  },
  monthLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  monthLoadingText: {
    color: theme.text.secondary,
    fontSize: 12,
  },
});
