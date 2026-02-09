import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgendaItemEnrichedDto } from 'shared-types';
import { theme } from '@shared/theme/colors';
import { TimeSlotOverflow } from './TimeSlotOverflow';
import AppIcon from '@shared/components/icons/AppIcon';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { HOUR_SLOT_HEIGHT, MAX_VISIBLE_ITEMS } from '../../constants/agendaConstants';

interface TimeSlotProps {
  hour: number;
  label: string;
  items: AgendaItemEnrichedDto[];
  onItemPress: (item: AgendaItemEnrichedDto) => void;
  onToggleComplete: (item: AgendaItemEnrichedDto) => void;
  isWakeUpTime?: boolean;
  isSleepTime?: boolean;
  currentTimeOffset?: number;
}

export const TimeSlot = React.memo<TimeSlotProps>(
  ({
    hour,
    label,
    items,
    onItemPress,
    onToggleComplete,
    isWakeUpTime = false,
    isSleepTime = false,
    currentTimeOffset,
  }) => {
    const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
    const hiddenItems = items.slice(MAX_VISIBLE_ITEMS);
    const hasItems = items.length > 0;

    return (
      <View style={styles.container} pointerEvents="box-none">
        {currentTimeOffset !== undefined && (
          <CurrentTimeIndicator offsetY={currentTimeOffset} />
        )}
        <View style={styles.timeLabel} pointerEvents="none">
          <Text style={styles.timeLabelText}>{label}</Text>
          {isWakeUpTime && (
            <View style={[styles.indicatorBadge, styles.wakeBadge]}>
              <AppIcon name="sun" size={14} color={theme.accent.wake} />
              <Text style={styles.wakeLabel}>Wake</Text>
            </View>
          )}
          {isSleepTime && (
            <View style={[styles.indicatorBadge, styles.sleepBadge]}>
              <AppIcon name="moon" size={14} color={theme.accent.sleep} />
              <Text style={styles.sleepLabel}>Sleep</Text>
            </View>
          )}
        </View>
        <View style={styles.content} pointerEvents="box-none">
          {hasItems && <View style={styles.activeBackground} pointerEvents="none" />}
          <View style={[
            styles.divider,
            (isWakeUpTime || isSleepTime) && styles.dividerHighlight,
          ]} pointerEvents="none" />
          {hasItems && (
            <View style={styles.items} pointerEvents="box-none">
              <TimeSlotOverflow
                hour={hour}
                visibleItems={visibleItems}
                hiddenItems={hiddenItems}
                onItemPress={onItemPress}
                onToggleComplete={onToggleComplete}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.hour === nextProps.hour &&
      prevProps.label === nextProps.label &&
      prevProps.isWakeUpTime === nextProps.isWakeUpTime &&
      prevProps.isSleepTime === nextProps.isSleepTime &&
      prevProps.currentTimeOffset === nextProps.currentTimeOffset &&
      prevProps.items.length === nextProps.items.length &&
      prevProps.items.every((item, idx) => item.id === nextProps.items[idx]?.id)
    );
  }
);

const styles = StyleSheet.create({
  container: {
    height: HOUR_SLOT_HEIGHT,
    flexDirection: 'row',
  },
  timeLabel: {
    width: 60,
    paddingTop: 4,
    paddingRight: 8,
    alignItems: 'flex-end',
  },
  timeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  indicatorBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  wakeBadge: {
    backgroundColor: 'rgba(245, 180, 84, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 180, 84, 0.2)',
  },
  sleepBadge: {
    backgroundColor: 'rgba(155, 122, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(155, 122, 246, 0.2)',
  },
  wakeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.accent.wake,
  },
  sleepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.accent.sleep,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(79, 140, 255, 0.03)',
    borderRadius: 4,
  },
  divider: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.border.primary,
  },
  dividerHighlight: {
    height: 2,
    backgroundColor: theme.accent.primary,
  },
  items: {
    paddingTop: 12,
    paddingLeft: 8,
    paddingRight: 8,
  },
});
