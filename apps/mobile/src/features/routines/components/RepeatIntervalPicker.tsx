import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NumericStepper from '@shared/components/NumericStepper';
import { REPEAT_INTERVAL_PRESETS } from '../constants/routineConstants';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RepeatIntervalPickerProps {
  value: number;
  onChange: (minutes: number) => void;
  label?: string;
  hint?: string;
  error?: string;
}

export function RepeatIntervalPicker({
  value,
  onChange,
  label = 'Repeat Interval',
  hint,
  error,
}: RepeatIntervalPickerProps) {
  const matchingPreset = REPEAT_INTERVAL_PRESETS.find(p => p.minutes === value);
  const [isCustom, setIsCustom] = useState(!matchingPreset);

  useEffect(() => {
    const matched = REPEAT_INTERVAL_PRESETS.find(p => p.minutes === value);
    if (matched) setIsCustom(false);
  }, [value]);

  const handlePresetPress = (minutes: number) => {
    setIsCustom(false);
    onChange(minutes);
  };

  const handleCustomPress = () => {
    setIsCustom(true);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.presetRow}>
        {REPEAT_INTERVAL_PRESETS.map(preset => {
          const isActive = !isCustom && value === preset.minutes;
          return (
            <TouchableOpacity
              key={preset.minutes}
              style={[styles.presetChip, isActive && styles.presetChipActive]}
              onPress={() => handlePresetPress(preset.minutes)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetChipText, isActive && styles.presetChipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.presetChip, isCustom && styles.presetChipActive]}
          onPress={handleCustomPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.presetChipText, isCustom && styles.presetChipTextActive]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {isCustom && (
        <NumericStepper
          value={value}
          onChange={onChange}
          min={1}
          max={20160}
          step={60}
          unit="minutes"
          containerStyle={styles.customStepper}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(242, 154, 100, 0.12)',
    borderColor: 'rgba(242, 154, 100, 0.3)',
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  presetChipTextActive: {
    color: theme.accent.warning,
    fontWeight: '700',
  },
  customStepper: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
  },
  hintText: {
    fontSize: 12,
    color: theme.text.muted,
    marginTop: spacing.xs,
  },
});
