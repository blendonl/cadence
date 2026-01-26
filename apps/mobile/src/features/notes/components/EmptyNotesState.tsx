import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

interface EmptyNotesStateProps {
  onCreateNote: () => void;
  onCreateDailyNote: () => void;
}

export const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({
  onCreateNote,
  onCreateDailyNote,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <AppIcon name="note" size={28} color={theme.text.muted} />
      <Text style={styles.emptyTitle}>No Notes Yet</Text>
      <Text style={styles.emptyText}>
        Create notes to capture ideas, meeting minutes, and daily reflections.
      </Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity style={styles.createButton} onPress={onCreateNote}>
          <Text style={styles.createButtonText}>New Note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dailyButton} onPress={onCreateDailyNote}>
          <Text style={styles.dailyButtonText}>Today's Journal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: theme.text.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: theme.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  createButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
  },
  createButtonText: {
    color: theme.background.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  dailyButton: {
    backgroundColor: theme.glass.tint.neutral,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  dailyButtonText: {
    color: theme.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});
