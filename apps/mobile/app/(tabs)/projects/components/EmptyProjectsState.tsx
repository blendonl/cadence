import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, spacing } from '@shared/theme';
import { ProjectsIcon } from '@shared/components/icons/TabIcons';

export interface EmptyProjectsStateProps {
  onCreatePress: () => void;
}

const EmptyProjectsState: React.FC<EmptyProjectsStateProps> = ({
  onCreatePress,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <ProjectsIcon size={64} focused={false} />
      </View>
      <Text style={styles.emptyTitle}>No Projects Yet</Text>
      <Text style={styles.emptyText}>
        Create your first project to organize your boards, notes, and time
        tracking.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={onCreatePress}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Create Project</Text>
      </TouchableOpacity>
    </View>
  );
};

EmptyProjectsState.displayName = 'EmptyProjectsState';

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  createButton: {
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createButtonText: {
    color: theme.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(EmptyProjectsState);
