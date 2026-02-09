import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import uiConstants from '@shared/theme/uiConstants';

interface CreateRoutineFABProps {
  onPress: () => void;
}

export function CreateRoutineFAB({ onPress }: CreateRoutineFABProps) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <AppIcon name="add" size={28} color={theme.text.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.card.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
