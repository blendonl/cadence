import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme';

interface AddTaskButtonProps {
  onPress: () => void;
}

const AddTaskButton: React.FC<AddTaskButtonProps> = React.memo(({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AppIcon name="add" size={18} color={theme.accent.primary} />
      <Text style={styles.text}>Add Task</Text>
    </TouchableOpacity>
  );
});

AddTaskButton.displayName = 'AddTaskButton';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderStyle: 'dashed',
    backgroundColor: theme.background.elevated,
  },
  text: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    fontWeight: '500',
    color: theme.accent.primary,
  },
});

export default AddTaskButton;
