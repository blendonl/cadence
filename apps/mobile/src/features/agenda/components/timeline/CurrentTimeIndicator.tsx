import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@shared/theme/colors';

interface CurrentTimeIndicatorProps {
  offsetY: number;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({ offsetY }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1
    );
  }, [scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { top: offsetY }]} pointerEvents="none">
      <View style={styles.labelContainer}>
        <Text style={styles.nowLabel}>NOW</Text>
      </View>
      <Animated.View style={[styles.dot, pulseStyle]} />
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  labelContainer: {
    paddingRight: 4,
    paddingLeft: 8,
  },
  nowLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.status.error,
    letterSpacing: 0.5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.status.error,
    shadowColor: theme.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: theme.status.error,
    marginLeft: 4,
    shadowColor: theme.status.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
