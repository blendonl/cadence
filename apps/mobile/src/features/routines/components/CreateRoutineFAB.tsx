import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import AppIcon from '@shared/components/icons/AppIcon';
import theme, { CatppuccinColors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import uiConstants from '@shared/theme/uiConstants';

interface CreateRoutineFABProps {
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function CreateRoutineFAB({ onPress }: CreateRoutineFABProps) {
  return (
    <AnimatedTouchable
      entering={FadeInUp.delay(200).duration(400).springify()}
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <AppIcon name="add" size={26} color={theme.text.primary} />
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: CatppuccinColors.peach,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: CatppuccinColors.peach,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
