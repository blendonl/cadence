import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '@shared/components/Input';
import { STEP_TARGET_PRESETS, ROUTINE_TYPE_GRADIENTS } from '../constants/routineConstants';
import theme, { CatppuccinColors } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface StepTargetInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

const formatPresetLabel = (steps: number): string => {
  return steps >= 1000 ? `${steps / 1000}K` : steps.toString();
};

export function StepTargetInput({
  value,
  onChange,
  label = 'Step Target',
  hint = 'Steps per day',
  error,
  required = false,
}: StepTargetInputProps) {
  const numericValue = Number(value);
  const matchingPreset = STEP_TARGET_PRESETS.find(p => p === numericValue);
  const gradient = ROUTINE_TYPE_GRADIENTS.STEP;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.presetGrid}>
        {STEP_TARGET_PRESETS.map(preset => {
          const isActive = matchingPreset === preset;
          return (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                isActive && { backgroundColor: gradient.iconBg, borderColor: gradient.accent + '40' },
              ]}
              onPress={() => onChange(preset.toString())}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetValue,
                  isActive && { color: gradient.accent },
                ]}
              >
                {formatPresetLabel(preset)}
              </Text>
              <Text
                style={[
                  styles.presetUnit,
                  isActive && { color: gradient.accent + 'AA' },
                ]}
              >
                steps
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Input
        value={value}
        onChangeText={onChange}
        placeholder="Custom target..."
        keyboardType="number-pad"
        error={error}
        hint={hint}
        containerStyle={styles.input}
      />
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
  required: {
    color: theme.status.error,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 70,
  },
  presetValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.secondary,
  },
  presetUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  input: {
    marginBottom: 0,
  },
});
