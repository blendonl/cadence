import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskType } from 'shared-types';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';
import { AppIconName } from '@shared/components/icons/AppIcon';

interface TaskTypePickerProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
}

interface TaskTypeOption {
  type: TaskType;
  label: string;
  icon: AppIconName;
}

const TASK_TYPE_OPTIONS: TaskTypeOption[] = [
  { type: TaskType.TASK, label: 'Task', icon: 'task' },
  { type: TaskType.SUBTASK, label: 'Subtask', icon: 'subtask' },
  { type: TaskType.MEETING, label: 'Meeting', icon: 'users' },
];

export const TaskTypePicker: React.FC<TaskTypePickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {TASK_TYPE_OPTIONS.map(option => {
        return (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.button,
              value === option.type && styles.buttonActive,
            ]}
            onPress={() => onChange(option.type)}
          >
            <AppIcon
              name={option.icon}
              size={16}
              color={value === option.type ? theme.background.primary : theme.text.secondary}
            />
            <Text
              style={[
                styles.text,
                value === option.type && styles.textActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.card.background,
    borderWidth: 1,
    borderColor: theme.card.border,
    borderRadius: theme.radius.card,
  },
  buttonActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  text: {
    fontSize: 14,
    color: theme.text.primary,
  },
  textActive: {
    color: theme.background.primary,
    fontWeight: '600',
  },
});
