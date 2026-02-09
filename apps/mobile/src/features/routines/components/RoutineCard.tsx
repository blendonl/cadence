import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineDetailDto } from 'shared-types';
import { formatTargetDisplay } from '../utils/routineValidation';
import { ROUTINE_TYPE_BADGE_CONFIG, ROUTINE_TYPE_GRADIENTS } from '../constants/routineConstants';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineCardProps {
  routine: RoutineDetailDto;
  onPress: (routine: RoutineDetailDto) => void;
}

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const badgeConfig = ROUTINE_TYPE_BADGE_CONFIG[routine.type];
  const gradient = ROUTINE_TYPE_GRADIENTS[routine.type];
  const targetDisplay = formatTargetDisplay(routine.type, routine.target);
  const taskCount = routine.tasks?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(routine)}
      activeOpacity={0.8}
    >
      <View style={[styles.accentBar, { backgroundColor: gradient.accent }]} />

      <View style={styles.content}>
        <View style={styles.top}>
          <View style={[styles.iconWrap, { backgroundColor: gradient.iconBg }]}>
            <AppIcon name={badgeConfig.icon} size={20} color={gradient.accent} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name} numberOfLines={1}>{routine.name}</Text>
            <Text style={[styles.target, { color: gradient.accent }]}>{targetDisplay}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: routine.isActive
                  ? 'rgba(60, 203, 140, 0.1)'
                  : 'rgba(108, 120, 144, 0.1)',
              },
            ]}
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
                styles.statusText,
                {
                  color: routine.isActive
                    ? theme.status.success
                    : theme.text.muted,
                },
              ]}
            >
              {routine.isActive ? 'Active' : 'Paused'}
            </Text>
          </View>

          {taskCount > 0 && (
            <Text style={styles.taskCount}>
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </Text>
          )}

          <AppIcon name="arrow-right" size={14} color={theme.text.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: 6,
    backgroundColor: theme.background.elevated,
    borderRadius: 14,
    overflow: 'hidden',
  },
  accentBar: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  target: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskCount: {
    fontSize: 12,
    color: theme.text.muted,
    flex: 1,
  },
});
