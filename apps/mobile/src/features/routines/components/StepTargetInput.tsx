import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from '@shared/components/Input';
import { STEP_TARGET_PRESETS } from '../constants/routineConstants';
import theme from '@shared/theme/colors';
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

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.presetRow}>
        {STEP_TARGET_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset}
            style={[
              styles.presetButton,
              matchingPreset === preset && styles.presetButtonActive,
            ]}
            onPress={() => onChange(preset.toString())}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.presetButtonText,
                matchingPreset === preset && styles.presetButtonTextActive,
              ]}
            >
              {formatPresetLabel(preset)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Input
        value={value}
        onChangeText={onChange}
        placeholder="e.g., 8000"
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
    marginBottom: spacing.sm,
  },
  required: {
    color: theme.status.error,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  presetButtonTextActive: {
    color: theme.text.primary,
    fontWeight: '600',
  },
  input: {
    marginBottom: 0,
  },
});
