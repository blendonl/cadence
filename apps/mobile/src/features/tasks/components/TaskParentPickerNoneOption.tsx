import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskParentPickerNoneOptionProps {
  isSelected: boolean;
  onSelect: () => void;
}

export const TaskParentPickerNoneOption: React.FC<TaskParentPickerNoneOptionProps> = ({
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <Text style={styles.text}>None</Text>
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
  text: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  checkmark: {
    marginLeft: spacing.sm,
  },
});
