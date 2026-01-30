import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface TaskFormHeaderProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  title: string;
}

export const TaskFormHeader: React.FC<TaskFormHeaderProps> = ({
  onCancel,
  onSubmit,
  submitLabel = 'Create',
  submitDisabled = false,
  title,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onSubmit}
        style={styles.submitButton}
        disabled={submitDisabled}
      >
        <Text
          style={[
            styles.submitButtonText,
            submitDisabled && styles.submitButtonTextDisabled,
          ]}
        >
          {submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  cancelButton: {
    padding: spacing.xs,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  submitButton: {
    padding: spacing.xs,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent.primary,
  },
  submitButtonTextDisabled: {
    color: theme.text.muted,
  },
});
