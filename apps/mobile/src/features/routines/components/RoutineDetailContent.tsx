import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Routine } from '../domain/entities/Routine';
import { RoutineTaskList } from './RoutineTaskList';
import {
  formatTargetDisplay,
  formatRepeatInterval,
  formatActiveDays,
} from '../domain/utils/routineValidation';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineDetailContentProps {
  routine: Routine;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const TYPE_BADGE_CONFIG = {
  SLEEP: { color: theme.accent.info, label: 'Sleep', icon: '🌙' },
  STEP: { color: theme.accent.success, label: 'Steps', icon: '👟' },
  OTHER: { color: theme.text.muted, label: 'Other', icon: '📋' },
};

export function RoutineDetailContent({
  routine,
  onEdit,
  onDelete,
  onToggleStatus,
}: RoutineDetailContentProps) {
  const badgeConfig = TYPE_BADGE_CONFIG[routine.type];

  const handleDelete = () => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <GlassCard style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.icon}>{badgeConfig.icon}</Text>
          <Text style={styles.name}>{routine.name}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: badgeConfig.color }]}>
          <Text style={styles.typeBadgeText}>{badgeConfig.label}</Text>
        </View>
      </GlassCard>

      <GlassCard style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: routine.isActive ? theme.status.success : theme.text.muted },
            ]}
            onPress={onToggleStatus}
          >
            <Text style={styles.statusButtonText}>
              {routine.isActive ? 'Active' : 'Disabled'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Target</Text>
          <Text style={styles.detailValue}>
            {formatTargetDisplay(routine.type, routine.target)}
          </Text>
        </View>

        {routine.type === 'STEP' && routine.separateInto > 1 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Separate Into</Text>
            <Text style={styles.detailValue}>{routine.separateInto} tasks</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Repeat Interval</Text>
          <Text style={styles.detailValue}>
            {formatRepeatInterval(routine.repeatIntervalMinutes)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Active Days</Text>
          <Text style={styles.detailValue}>{formatActiveDays(routine.activeDays)}</Text>
        </View>
      </GlassCard>

      <RoutineTaskList tasks={routine.tasks} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit Routine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Routine</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text.primary,
    flex: 1,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.secondary,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.tertiary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  statusButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  editButton: {
    backgroundColor: theme.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  deleteButton: {
    backgroundColor: theme.background.elevated,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.status.error,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.status.error,
  },
});
