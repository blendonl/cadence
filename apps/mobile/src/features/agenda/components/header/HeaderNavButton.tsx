import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AppIcon from '@shared/components/icons/AppIcon';
import { theme } from '@shared/theme/colors';
import { TIMING_CONFIG } from '@shared/utils/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type IconName = 'arrow-left' | 'arrow-right' | 'sun';

interface HeaderNavButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'default' | 'today';
  size?: number;
}

export const HeaderNavButton: React.FC<HeaderNavButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'default',
  size = 32,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.85, TIMING_CONFIG.fast);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, TIMING_CONFIG.fast);
  }, [scale]);

  const isToday = variant === 'today';
  const iconSize = isToday ? 14 : 16;
  const iconColor = isToday ? theme.accent.primary : theme.text.primary;

  return (
    <AnimatedPressable
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        isToday && styles.todayButton,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <AppIcon name={icon} size={iconSize} color={iconColor} />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  todayButton: {
    backgroundColor: theme.glass.tint.blue,
  },
});
