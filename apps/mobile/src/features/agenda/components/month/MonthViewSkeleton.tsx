import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export const MonthViewSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

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
      <View style={styles.weekdayRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.weekdayBox} />
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 35 }).map((_, i) => (
          <View key={i} style={styles.dayCell}>
            <View style={styles.dayNumber} />
            {i % 3 === 0 && <View style={styles.chipLine} />}
            {i % 5 === 0 && <View style={styles.chipLine} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  weekdayBox: {
    width: '14.28%',
    height: 12,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 80,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.secondary,
  },
  dayNumber: {
    width: 16,
    height: 12,
    borderRadius: 3,
    backgroundColor: theme.background.elevated,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  chipLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: theme.background.elevated,
    marginBottom: 2,
  },
});
