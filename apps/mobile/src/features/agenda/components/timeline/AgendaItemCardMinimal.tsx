import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import AppIcon from '@shared/components/icons/AppIcon';
import { getScheduledTime, isItemCompleted } from '../../utils/agendaHelpers';
import { formatTime, formatDuration, getAccentColor, getTaskTypeIcon } from '../../utils/agendaFormatters';
import { getCardTintColor } from '../../utils/cardStyles';

interface AgendaItemCardMinimalProps {
  item: AgendaItemEnrichedDto;
  onPress: () => void;
  onToggleComplete?: () => void;
}

export const AgendaItemCardMinimal = React.memo<AgendaItemCardMinimalProps>(
  ({ item, onPress, onToggleComplete }) => {
  const isCompleted = isItemCompleted(item);
  const accentColor = useMemo(() => getAccentColor(item), [item]);
  const tintColor = useMemo(() => getCardTintColor(item), [item]);
  const taskType = (item.task?.taskType || 'regular') as 'regular' | 'meeting' | 'milestone' | null;
  const isRoutine = !!item.routineTaskId;
  const iconName = useMemo(() => getTaskTypeIcon(taskType, isRoutine), [taskType, isRoutine]);

  const title = useMemo(
    () =>
      item.task?.title ||
      item.routineTask?.name ||
      item.routineTask?.routineName ||
      'Untitled',
    [item]
  );

  const timeLabel = useMemo(() => formatTime(getScheduledTime(item)), [item]);
  const durationLabel = useMemo(() => formatDuration(item.duration), [item.duration]);

  const metadata = useMemo(() => {
    const parts: string[] = [];
    if (timeLabel) parts.push(timeLabel);
    if (durationLabel) parts.push(durationLabel);
    return parts.join(' • ');
  }, [timeLabel, durationLabel]);

  const statusHitSlop = { top: 14, right: 14, bottom: 14, left: 14 };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: accentColor, backgroundColor: tintColor || theme.card.background },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${title}${metadata ? `, ${metadata}` : ''}`}
      accessibilityRole="button"
      accessibilityHint="Double tap to view details"
      accessibilityState={{ selected: isCompleted }}
    >
      <AppIcon name={iconName} size={14} color={accentColor} />
      <View style={styles.content}>
        <Text
          style={[styles.title, isCompleted && styles.titleCompleted]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {metadata && <Text style={styles.metadata}>{metadata}</Text>}
      </View>
      {onToggleComplete && (
        <TouchableOpacity
          style={[
            styles.statusButton,
            isCompleted && styles.statusButtonCompleted,
          ]}
          onPress={e => {
            e.stopPropagation();
            onToggleComplete();
          }}
          activeOpacity={0.7}
          hitSlop={statusHitSlop}
          accessibilityLabel={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
        >
          <AppIcon
            name="check"
            size={14}
            color={isCompleted ? theme.background.primary : theme.accent.success}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.status === nextProps.item.status &&
      prevProps.item.startAt === nextProps.item.startAt &&
      prevProps.item.duration === nextProps.item.duration
    );
  }
);

const styles = StyleSheet.create({
  card: {
    minHeight: 44,
    backgroundColor: theme.card.background,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderColor: theme.card.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.text.tertiary,
  },
  metadata: {
    fontSize: 10,
    color: theme.text.secondary,
    marginTop: 2,
  },
  statusButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.accent.success,
    backgroundColor: theme.card.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonCompleted: {
    backgroundColor: theme.accent.success,
    borderColor: theme.accent.success,
  },
});
