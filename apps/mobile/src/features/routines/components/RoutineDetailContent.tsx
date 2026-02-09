import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { RoutineDetailDto } from 'shared-types';
import { RoutineTaskList } from './RoutineTaskList';
import {
  formatTargetDisplay,
  formatRepeatInterval,
  formatActiveDays,
} from '../utils/routineValidation';
import {
  ROUTINE_TYPE_BADGE_CONFIG,
  ROUTINE_TYPE_GRADIENTS,
  FIXED_DAILY_TYPES,
} from '../constants/routineConstants';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineDetailContentProps {
  routine: RoutineDetailDto;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export function RoutineDetailContent({
  routine,
  onEdit,
  onDelete,
  onToggleStatus,
}: RoutineDetailContentProps) {
  const badgeConfig = ROUTINE_TYPE_BADGE_CONFIG[routine.type];
  const gradient = ROUTINE_TYPE_GRADIENTS[routine.type];
  const isFixedDaily = FIXED_DAILY_TYPES.includes(routine.type);
  const targetDisplay = formatTargetDisplay(routine.type, routine.target);

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
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <AppIcon name={badgeConfig.icon} size={28} color={gradient.accent} />
        </View>
        <Text style={styles.heroName}>{routine.name}</Text>
        <Text style={styles.heroTarget}>{targetDisplay}</Text>

        <View style={styles.heroActions}>
          <TouchableOpacity
            style={[
              styles.statusPill,
              {
                backgroundColor: routine.isActive
                  ? 'rgba(60, 203, 140, 0.15)'
                  : 'rgba(108, 120, 144, 0.15)',
              },
            ]}
            onPress={onToggleStatus}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: routine.isActive
                    ? theme.status.success
                    : theme.text.muted,
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                {
                  color: routine.isActive
                    ? theme.status.success
                    : theme.text.muted,
                },
              ]}
            >
              {routine.isActive ? 'Active' : 'Paused'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsSection}>
        {routine.type === 'STEP' && routine.separateInto > 1 && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Split Into</Text>
            <Text style={styles.statValue}>{routine.separateInto} tasks</Text>
          </View>
        )}

        {!isFixedDaily && (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Repeat</Text>
              <Text style={styles.statValue}>
                {formatRepeatInterval(routine.repeatIntervalMinutes)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Days</Text>
              <Text style={styles.statValue}>
                {formatActiveDays(routine.activeDays)}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.taskSection}>
        <RoutineTaskList tasks={routine.tasks} accentColor={gradient.accent} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <AppIcon name="edit" size={18} color={gradient.accent} />
          <Text style={[styles.actionButtonText, { color: gradient.accent }]}>Edit Routine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <AppIcon name="trash" size={18} color={theme.status.error} />
          <Text style={[styles.actionButtonText, { color: theme.status.error }]}>Delete</Text>
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
    paddingBottom: spacing.xxxl,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  heroActions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: 14,
    padding: spacing.lg,
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
  },
  taskSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(242, 107, 107, 0.1)',
    borderColor: 'transparent',
    flex: 0.6,
  },
});
