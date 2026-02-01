import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineDetailDto } from 'shared-types';
import { formatTargetDisplay } from '../utils/routineValidation';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineCardProps {
  routine: RoutineDetailDto;
  onPress: (routine: RoutineDetailDto) => void;
}

const TYPE_BADGE_CONFIG = {
  SLEEP: { color: theme.accent.info, label: 'Sleep', icon: '🌙' },
  STEP: { color: theme.accent.success, label: 'Steps', icon: '👟' },
  OTHER: { color: theme.text.muted, label: 'Other', icon: '📋' },
};

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const badgeConfig = TYPE_BADGE_CONFIG[routine.type];
  const targetDisplay = formatTargetDisplay(routine.type, routine.target);
  const taskCount = routine.tasks?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(routine)}
      activeOpacity={0.7}
    >
      <GlassCard style={styles.cardInner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{badgeConfig.icon}</Text>
            <View>
              <Text style={styles.name}>{routine.name}</Text>
              <Text style={styles.target}>{targetDisplay}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: badgeConfig.color }]}>
            <Text style={styles.badgeText}>{badgeConfig.label}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: routine.isActive ? theme.status.success : theme.text.muted },
            ]}
          >
            <Text style={styles.statusText}>
              {routine.isActive ? 'Active' : 'Disabled'}
            </Text>
          </View>

          <Text style={styles.taskCount}>
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </Text>

          <Text style={styles.chevron}>›</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  cardInner: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 2,
  },
  target: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIndicator: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.text.primary,
  },
  taskCount: {
    fontSize: 12,
    color: theme.text.tertiary,
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    color: theme.text.muted,
  },
});
