import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskScheduleChipProps {
  scheduledDate?: string;
  scheduledTime?: string;
  onPress: () => void;
}

function formatScheduleTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

export const TaskScheduleChip: React.FC<TaskScheduleChipProps> = ({
  scheduledDate,
  scheduledTime,
  onPress,
}) => {
  const displayText = scheduledDate
    ? `${scheduledDate}${scheduledTime ? ` ${formatScheduleTime(scheduledTime)}` : ''}`
    : 'Schedule';

  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.85}>
      <AppIcon name="calendar" size={16} color={theme.text.secondary} />
      <Text style={styles.chipText}>{displayText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  chipText: {
    color: theme.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
