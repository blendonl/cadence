import React, { useCallback } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { AgendaViewMode } from 'shared-types';
import { theme } from '@shared/theme/colors';

const BUTTON_WIDTH = 32;
const BUTTON_HEIGHT = 28;

const OPTIONS: Array<{ label: string; value: AgendaViewMode }> = [
  { label: 'D', value: 'day' },
  { label: 'W', value: 'week' },
  { label: 'M', value: 'month' },
];

interface ViewModePillProps {
  value: AgendaViewMode;
  onChange: (mode: AgendaViewMode) => void;
}

export const ViewModePill: React.FC<ViewModePillProps> = ({ value, onChange }) => {
  const activeIndex = OPTIONS.findIndex((o) => o.value === value);
  const currentOption = OPTIONS[activeIndex];

  const handlePress = useCallback(() => {
    const nextIndex = (activeIndex + 1) % OPTIONS.length;
    onChange(OPTIONS[nextIndex].value);
  }, [activeIndex, onChange]);

  const getAccessibilityLabel = () => {
    const viewName = currentOption.label === 'D' ? 'Day' :
                     currentOption.label === 'W' ? 'Week' : 'Month';
    const nextIndex = (activeIndex + 1) % OPTIONS.length;
    const nextViewName = OPTIONS[nextIndex].label === 'D' ? 'Day' :
                         OPTIONS[nextIndex].label === 'W' ? 'Week' : 'Month';
    return `${viewName} view, tap to switch to ${nextViewName}`;
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
    >
      <Text style={styles.buttonText}>{currentOption.label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 9999,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.background.primary,
  },
});
