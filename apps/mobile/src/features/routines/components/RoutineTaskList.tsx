import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoutineTask } from '../domain/entities/RoutineTask';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineTaskListProps {
  tasks: RoutineTask[];
  onTaskPress?: (task: RoutineTask) => void;
}

export function RoutineTaskList({ tasks }: RoutineTaskListProps) {
  if (tasks.length === 0) {
    return (
      <GlassCard style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Tasks will be auto-generated based on routine configuration
        </Text>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tasks (auto-generated)</Text>
      {tasks.map((task, index) => (
        <GlassCard key={task.id} style={styles.taskCard}>
          <View style={styles.taskNumber}>
            <Text style={styles.taskNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskName}>{task.name}</Text>
            <Text style={styles.taskTarget}>Target: {task.target}</Text>
          </View>
        </GlassCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.md,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 2,
  },
  taskTarget: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});
