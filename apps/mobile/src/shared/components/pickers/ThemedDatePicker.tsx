import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';

interface ThemedDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onClose?: () => void;
  showQuickActions?: boolean;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const ThemedDatePicker: React.FC<ThemedDatePickerProps> = ({
  value,
  onChange,
  onClose,
  showQuickActions = true,
}) => {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewMonth, setViewMonth] = useState<Date>(() => getMonthStart(selectedDate));

  useEffect(() => {
    if (value) {
      setViewMonth(getMonthStart(selectedDate));
    }
  }, [value]);

  const monthGrid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);
  const todayString = formatDateString(new Date());

  return (
    <View>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setViewMonth(addMonths(viewMonth, -1))}
          accessibilityLabel="Previous month"
        >
          <AppIcon name="arrow-left" size={18} color={theme.text.secondary} />
        </TouchableOpacity>
        <View style={styles.monthLabelPill}>
          <Text style={styles.monthLabel}>{formatMonthYear(viewMonth)}</Text>
        </View>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setViewMonth(addMonths(viewMonth, 1))}
          accessibilityLabel="Next month"
        >
          <AppIcon name="arrow-right" size={18} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekLabel}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {monthGrid.map(cell => {
          const isSelected = cell.dateString === value;
          const isToday = cell.dateString === todayString;

          return (
            <TouchableOpacity
              key={cell.dateString}
              style={[
                styles.dayCell,
                !cell.inMonth && styles.dayCellOutside,
                isSelected && styles.dayCellSelected,
                !isSelected && isToday && styles.dayCellToday,
              ]}
              onPress={() => {
                onChange(cell.dateString);
                setViewMonth(getMonthStart(new Date(`${cell.dateString}T00:00:00`)));
              }}
            >
              <Text
                style={[
                  styles.dayLabel,
                  !cell.inMonth && styles.dayLabelOutside,
                  isSelected && styles.dayLabelSelected,
                  !isSelected && isToday && styles.dayLabelToday,
                ]}
              >
                {cell.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {(showQuickActions || onClose) && (
        <View style={styles.actionsRow}>
          {showQuickActions && (
            <TouchableOpacity
              style={styles.actionGhost}
              onPress={() => {
                onChange(todayString);
                setViewMonth(getMonthStart(new Date()));
              }}
            >
              <Text style={styles.actionGhostText}>Today</Text>
            </TouchableOpacity>
          )}
          {onClose && (
            <TouchableOpacity style={styles.actionPrimary} onPress={onClose}>
              <Text style={styles.actionPrimaryText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getIsoDayOfWeek(dateString: string): number {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getMonthGrid(viewMonth: Date): { dateString: string; day: number; inMonth: boolean }[] {
  const monthStart = getMonthStart(viewMonth);
  const isoDow = getIsoDayOfWeek(formatDateString(monthStart));
  const offset = isoDow - 1;
  const gridStart = addDays(monthStart, -offset);

  return Array.from({ length: 42 }).map((_, index) => {
    const date = addDays(gridStart, index);
    return {
      dateString: formatDateString(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthStart.getMonth(),
    };
  });
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  navButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  monthLabelPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.background.elevatedHigh,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  monthLabel: {
    color: theme.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: theme.text.tertiary,
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 2,
  },
  dayCellOutside: {
    opacity: 0.55,
  },
  dayCellSelected: {
    backgroundColor: theme.accent.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: theme.accent.primary,
  },
  dayLabel: {
    color: theme.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  dayLabelOutside: {
    color: theme.text.tertiary,
  },
  dayLabelSelected: {
    color: theme.background.primary,
    fontWeight: '800',
  },
  dayLabelToday: {
    color: theme.accent.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  actionGhost: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: theme.border.primary,
    backgroundColor: theme.background.elevated,
  },
  actionGhostText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionPrimary: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.button,
    backgroundColor: theme.accent.primary,
  },
  actionPrimaryText: {
    color: theme.background.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
