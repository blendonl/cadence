import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme';

interface QuickTaskCreateButtonProps {
  onPress: () => void;
}

export default function QuickTaskCreateButton({ onPress }: QuickTaskCreateButtonProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <AppIcon name="add" size={18} color={theme.accent.primary} />
      <Text style={styles.label}>Create New Task</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.accent.primary + '12',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.accent.primary + '40',
    borderStyle: 'dashed',
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.textStyles.body,
    color: theme.accent.primary,
    fontWeight: '600',
  },
});
