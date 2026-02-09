import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineDetailDto } from 'shared-types';
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

interface RoutineSummaryCardProps {
  routine: RoutineDetailDto;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

export function RoutineSummaryCard({ routine, onEdit, onToggleStatus }: RoutineSummaryCardProps) {
  const badgeConfig = ROUTINE_TYPE_BADGE_CONFIG[routine.type];
  const gradient = ROUTINE_TYPE_GRADIENTS[routine.type];
  const isFixedDaily = FIXED_DAILY_TYPES.includes(routine.type);

  const targetDisplay = formatTargetDisplay(routine.type, routine.target);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.targetValue}>{targetDisplay}</Text>
        </View>
        <View style={styles.headerActions}>
          {onToggleStatus && (
            <TouchableOpacity
              style={[
                styles.statusPill,
                {
                  backgroundColor: routine.isActive
                    ? 'rgba(60, 203, 140, 0.12)'
                    : 'rgba(108, 120, 144, 0.12)',
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
          )}
          {onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <AppIcon name="edit" size={18} color={gradient.accent} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsGrid}>
        {routine.type === 'STEP' && routine.separateInto > 1 && (
          <StatItem label="Split Into" value={`${routine.separateInto} tasks`} />
        )}
        {!isFixedDaily && (
          <>
            <StatItem
              label="Repeat"
              value={formatRepeatInterval(routine.repeatIntervalMinutes)}
            />
            <StatItem
              label="Active Days"
              value={formatActiveDays(routine.activeDays)}
            />
          </>
        )}
      </View>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: 20,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  targetValue: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 12,
    padding: spacing.md,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
