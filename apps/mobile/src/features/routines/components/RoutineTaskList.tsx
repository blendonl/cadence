import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoutineTaskDto } from 'shared-types';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineTaskListProps {
  tasks: RoutineTaskDto[];
  accentColor?: string;
  onTaskPress?: (task: RoutineTaskDto) => void;
}

export function RoutineTaskList({
  tasks,
  accentColor = theme.accent.primary,
}: RoutineTaskListProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyDot} />
        <Text style={styles.emptyText}>
          Tasks will be auto-generated based on routine configuration
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks</Text>
      {tasks.map((task, index) => (
        <View key={task.id} style={styles.taskRow}>
          <View style={styles.timeline}>
            <View style={[styles.timelineDot, { backgroundColor: accentColor }]} />
            {index < tasks.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: accentColor + '30' }]} />
            )}
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={[styles.taskTarget, { color: accentColor }]}>
              Target: {task.target}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  header: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -4,
  },
  taskContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
    gap: 3,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text.primary,
  },
  taskTarget: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: theme.background.elevated,
    borderRadius: 12,
    padding: spacing.lg,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.text.muted,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 13,
    color: theme.text.muted,
    flex: 1,
  },
});
