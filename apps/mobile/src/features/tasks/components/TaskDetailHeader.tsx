import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskDetailHeaderProps {
  onDelete: () => void;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({ onDelete }) => {
  const handleOpenMenu = () => {
    Alert.alert('Task Options', '', [
      {
        text: 'Delete Task',
        style: 'destructive',
        onPress: onDelete,
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.menuButton} onPress={handleOpenMenu}>
        <AppIcon name="more" size={20} color={theme.text.secondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  spacer: {
    flex: 1,
  },
  menuButton: {
    padding: spacing.xs,
  },
});
