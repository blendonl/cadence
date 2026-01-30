import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import theme from '@shared/theme';

interface DropIndicatorProps {
  isValid: boolean;
  visible: boolean;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({ isValid, visible }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(visible ? 1 : 0, { damping: 15, stiffness: 150 }),
      scaleY: withSpring(visible ? 1 : 0, { damping: 15, stiffness: 150 }),
      backgroundColor: isValid ? theme.accent.success : theme.accent.error,
    };
  });

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
};

const styles = StyleSheet.create({
  indicator: {
    height: 3,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
    borderRadius: 2,
  },
});
