import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '@shared/theme/colors';
import uiConstants from '@shared/theme/uiConstants';

interface AgendaFABProps {
  onPress: () => void;
}

export function AgendaFAB({ onPress }: AgendaFABProps) {
  const insets = useSafeAreaInsets();
  const fabBottom = uiConstants.TAB_BAR_HEIGHT + uiConstants.TAB_BAR_BOTTOM_MARGIN + insets.bottom + 24;

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: fabBottom }]}
      onPress={onPress}
    >
      <Text style={styles.fabText}>+</Text>
    </TouchableOpacity>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: theme.background.primary,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});
