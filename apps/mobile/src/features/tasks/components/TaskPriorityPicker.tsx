import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskPriority } from 'shared-types';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { PRIORITY_OPTIONS } from '../constants/priorities';

interface TaskPriorityPickerProps {
  selectedPriority: TaskPriority;
  onSelect: (priority: TaskPriority) => void;
}

export const TaskPriorityPicker: React.FC<TaskPriorityPickerProps> = ({
  selectedPriority,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.optionRow}>
        {PRIORITY_OPTIONS.map((option) => {
          const isActive = selectedPriority === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                isActive && {
                  borderColor: option.color,
                  backgroundColor: option.color + '20',
                },
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: isActive ? option.color : theme.text.muted },
                ]}
              />
              <Text
                style={[
                  styles.optionLabel,
                  { color: isActive ? option.color : theme.text.secondary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  optionLabel: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
