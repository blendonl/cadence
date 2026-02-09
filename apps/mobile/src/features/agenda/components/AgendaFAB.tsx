import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@shared/theme/colors';
import uiConstants from '@shared/theme/uiConstants';
import AppIcon from '@shared/components/icons/AppIcon';
import { TIMING_CONFIG } from '@shared/utils/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AgendaFABProps {
  onPress: () => void;
}

export function AgendaFAB({ onPress }: AgendaFABProps) {
  const insets = useSafeAreaInsets();
  const fabBottom = uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + insets.bottom + 24;

  const entranceScale = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    entranceScale.value = withSpring(1, { damping: 12, stiffness: 150 });
  }, [entranceScale]);

  const handlePressIn = useCallback(() => {
    pressScale.value = withTiming(0.88, TIMING_CONFIG.fast);
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withTiming(1, TIMING_CONFIG.fast);
  }, [pressScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: entranceScale.value * pressScale.value },
    ],
  }));

  return (
    <AnimatedPressable
      style={[styles.fab, { bottom: fabBottom }, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel="Schedule new task"
      accessibilityRole="button"
      accessibilityHint="Opens task selector modal"
    >
      <AppIcon name="add" size={24} color={theme.background.primary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: theme.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
