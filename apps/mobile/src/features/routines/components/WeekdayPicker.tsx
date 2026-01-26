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
  { value: 'THU', label: 'Th' },
  { value: 'FRI', label: 'F' },
  { value: 'SAT', label: 'Sa' },
  { value: 'SUN', label: 'Su' },
];

export function WeekdayPicker({ label, value, onChange, error }: WeekdayPickerProps) {
  const isAllDays = value === null || value.length === 7;

  const toggleDay = (day: string) => {
    if (value === null) {
      // If all days selected, deselect all except this one
      onChange([day]);
    } else {
      if (value.includes(day)) {
        // Remove day
        const newDays = value.filter((d) => d !== day);
        onChange(newDays.length === 0 ? null : newDays);
      } else {
        // Add day
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
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.allDaysButton, isAllDays && styles.allDaysButtonActive]}
        onPress={toggleAllDays}
      >
        <Text style={[styles.allDaysText, isAllDays && styles.allDaysTextActive]}>
          All Days
        </Text>
      </TouchableOpacity>

      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[styles.dayButton, isDaySelected(day.value) && styles.dayButtonActive]}
            onPress={() => toggleDay(day.value)}
          >
            <Text
              style={[styles.dayText, isDaySelected(day.value) && styles.dayTextActive]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.sm,
  },
  allDaysButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  allDaysButtonActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  allDaysText: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  allDaysTextActive: {
    color: theme.text.primary,
    fontWeight: '600',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dayButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  dayTextActive: {
    color: theme.text.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
  },
});
