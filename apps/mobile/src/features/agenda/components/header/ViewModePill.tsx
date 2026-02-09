import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AgendaViewMode } from 'shared-types';
import { theme } from '@shared/theme/colors';

const SEGMENT_WIDTH = 32;
const PILL_HEIGHT = 28;
const SEGMENT_COUNT = 3;
const PILL_PADDING = 2;

const OPTIONS: Array<{ label: string; value: AgendaViewMode }> = [
  { label: 'D', value: 'day' },
  { label: 'W', value: 'week' },
  { label: 'M', value: 'month' },
];

const SPRING_CONFIG = { damping: 15, stiffness: 150 };

interface ViewModePillProps {
  value: AgendaViewMode;
  onChange: (mode: AgendaViewMode) => void;
}

export const ViewModePill: React.FC<ViewModePillProps> = ({ value, onChange }) => {
  const activeIndex = OPTIONS.findIndex((o) => o.value === value);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withSpring(activeIndex * SEGMENT_WIDTH, SPRING_CONFIG),
      },
    ],
  }));

  const handlePress = useCallback(
    (mode: AgendaViewMode) => {
      onChange(mode);
    },
    [onChange],
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            onPress={() => handlePress(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${option.label === 'D' ? 'Day' : option.label === 'W' ? 'Week' : 'Month'} view`}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: SEGMENT_WIDTH * SEGMENT_COUNT + PILL_PADDING * 2,
    height: PILL_HEIGHT,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: PILL_PADDING,
    position: 'relative',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    left: PILL_PADDING,
    width: SEGMENT_WIDTH,
    height: PILL_HEIGHT - PILL_PADDING * 2,
    borderRadius: 9999,
    backgroundColor: theme.accent.primary,
  },
  segment: {
    width: SEGMENT_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.text.tertiary,
  },
  segmentTextActive: {
    color: theme.background.primary,
  },
});
