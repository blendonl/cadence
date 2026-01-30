import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskParentPickerHeaderProps {
  onClose: () => void;
}

export const TaskParentPickerHeader: React.FC<TaskParentPickerHeaderProps> = ({ onClose }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Select Parent Task</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.closeButton}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: theme.accent.primary,
    fontWeight: '600',
  },
});
