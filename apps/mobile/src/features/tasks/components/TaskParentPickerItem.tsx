import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Task } from '../domain/entities/Task';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskParentPickerItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
}

export const TaskParentPickerItem: React.FC<TaskParentPickerItemProps> = ({
  task,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <View style={styles.taskInfo}>
        <Text style={styles.taskTitle} numberOfLines={1}>
          {task.title}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <AppIcon name="check" size={18} color={theme.accent.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  taskInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  taskTitle: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '500',
  },
  checkmark: {
    marginLeft: spacing.sm,
  },
});
