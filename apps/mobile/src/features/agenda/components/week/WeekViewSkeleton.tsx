import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { HOUR_SLOT_HEIGHT, TIME_COLUMN_WIDTH } from '../../constants/agendaConstants';

export const WeekViewSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { width } = useWindowDimensions();
  const dayWidth = Math.max(44, (width - TIME_COLUMN_WIDTH - spacing.lg * 2) / 7);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.headerRow}>
        <View style={{ width: TIME_COLUMN_WIDTH }} />
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={[styles.dayHeader, { width: dayWidth }]}>
            <View style={styles.dayLabelBox} />
            <View style={styles.dayDateBox} />
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        <View style={{ width: TIME_COLUMN_WIDTH }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={[styles.timeSlot, { height: HOUR_SLOT_HEIGHT }]}>
              <View style={styles.timeLabelBox} />
            </View>
          ))}
        </View>
        <View style={styles.columns}>
          {Array.from({ length: 7 }).map((_, col) => (
            <View key={col} style={[styles.column, { width: dayWidth }]}>
              {Array.from({ length: 8 }).map((_, row) => (
                <View key={row} style={[styles.hourLine, { top: row * HOUR_SLOT_HEIGHT }]} />
              ))}
              {col % 2 === 0 && <View style={[styles.eventBlock, { top: HOUR_SLOT_HEIGHT * 2 }]} />}
              {col % 3 === 1 && <View style={[styles.eventBlock, { top: HOUR_SLOT_HEIGHT * 4 }]} />}
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  dayHeader: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabelBox: {
    width: 20,
    height: 10,
    borderRadius: 3,
    backgroundColor: theme.background.elevated,
  },
  dayDateBox: {
    width: 16,
    height: 12,
    borderRadius: 3,
    backgroundColor: theme.background.elevated,
  },
  grid: {
    flexDirection: 'row',
    flex: 1,
  },
  timeSlot: {
    justifyContent: 'flex-start',
    paddingTop: 4,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeLabelBox: {
    width: 32,
    height: 12,
    borderRadius: 3,
    backgroundColor: theme.background.elevated,
  },
  columns: {
    flexDirection: 'row',
    flex: 1,
  },
  column: {
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: theme.border.secondary,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.border.primary,
  },
  eventBlock: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: HOUR_SLOT_HEIGHT * 1.5,
    borderRadius: 6,
    backgroundColor: theme.background.elevated,
  },
});
