import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface WeekdayPickerProps {
  label: string;
  value: string[] | null;
  onChange: (days: string[] | null) => void;
  error?: string;
}

const WEEKDAYS = [
  { value: 'MON', label: 'M' },
  { value: 'TUE', label: 'T' },
  { value: 'WED', label: 'W' },
  { value: 'THU', label: 'T' },
  { value: 'FRI', label: 'F' },
  { value: 'SAT', label: 'S' },
  { value: 'SUN', label: 'S' },
];

export function WeekdayPicker({ label, value, onChange, error }: WeekdayPickerProps) {
  const isAllDays = value === null || value.length === 7;

  const toggleDay = (day: string) => {
    if (value === null) {
      onChange([day]);
    } else {
      if (value.includes(day)) {
        const newDays = value.filter((d) => d !== day);
        onChange(newDays.length === 0 ? null : newDays);
      } else {
        const newDays = [...value, day];
        onChange(newDays.length === 7 ? null : newDays);
      }
    }
  };

  const toggleAllDays = () => {
    onChange(isAllDays ? [] : null);
  };

  const isDaySelected = (day: string) => {
    return value === null || value.includes(day);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.allDaysChip, isAllDays && styles.allDaysChipActive]}
          onPress={toggleAllDays}
        >
          <Text style={[styles.allDaysText, isAllDays && styles.allDaysTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => {
          const selected = isDaySelected(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              style={[styles.dayButton, selected && styles.dayButtonActive]}
              onPress={() => toggleDay(day.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, selected && styles.dayTextActive]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  allDaysChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.background.elevated,
  },
  allDaysChipActive: {
    backgroundColor: 'rgba(242, 154, 100, 0.12)',
  },
  allDaysText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.muted,
  },
  allDaysTextActive: {
    color: theme.accent.warning,
  },
  weekdaysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: 'rgba(242, 154, 100, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(242, 154, 100, 0.3)',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.muted,
  },
  dayTextActive: {
    color: theme.accent.warning,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
  },
});
