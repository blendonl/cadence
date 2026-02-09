import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineDetailDto } from 'shared-types';
import {
  formatTargetDisplay,
  formatRepeatInterval,
  formatActiveDays,
} from '../utils/routineValidation';
import { ROUTINE_TYPE_BADGE_CONFIG, FIXED_DAILY_TYPES } from '../constants/routineConstants';
import GlassCard from '@shared/components/GlassCard';
import AppIcon from '@shared/components/icons/AppIcon';
import { PrimaryButton } from '@shared/components/Button';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineSummaryCardProps {
  routine: RoutineDetailDto;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

export function RoutineSummaryCard({ routine, onEdit, onToggleStatus }: RoutineSummaryCardProps) {
  const badgeConfig = ROUTINE_TYPE_BADGE_CONFIG[routine.type];
  const isFixedDaily = FIXED_DAILY_TYPES.includes(routine.type);

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppIcon name={badgeConfig.icon} size={28} color={badgeConfig.color} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{routine.name}</Text>
            <Text style={styles.target}>{formatTargetDisplay(routine.type, routine.target)}</Text>
          </View>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: badgeConfig.color }]}>
          <Text style={styles.typeBadgeText}>{badgeConfig.label}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          {onToggleStatus ? (
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
          ) : (
            <Text style={styles.detailValue}>{routine.isActive ? 'Active' : 'Disabled'}</Text>
          )}
        </View>

        {routine.type === 'STEP' && routine.separateInto > 1 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Separate Into</Text>
            <Text style={styles.detailValue}>{routine.separateInto} tasks</Text>
          </View>
        )}

        {!isFixedDaily && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Repeat Interval</Text>
            <Text style={styles.detailValue}>
              {formatRepeatInterval(routine.repeatIntervalMinutes)}
            </Text>
          </View>
        )}

        {!isFixedDaily && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active Days</Text>
            <Text style={styles.detailValue}>{formatActiveDays(routine.activeDays)}</Text>
          </View>
        )}
      </View>

      {onEdit && (
        <PrimaryButton title="Edit Routine" onPress={onEdit} fullWidth style={styles.editButton} />
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  target: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  typeBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.primary,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.border.secondary,
    paddingTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.secondary,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text.tertiary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
  },
  statusButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.primary,
  },
  editButton: {
    marginTop: spacing.lg,
  },
});
