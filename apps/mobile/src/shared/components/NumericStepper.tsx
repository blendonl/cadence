import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import theme from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface NumericStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  label?: string;
  unit?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
}

export default function NumericStepper({
  value,
  onChange,
  min,
  max,
  step: stepSize,
  label,
  unit,
  hint,
  error,
  required = false,
  containerStyle,
}: NumericStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const handleDecrement = async () => {
    if (atMin) return;
    const next = Math.max(min, Math.round((value - stepSize) * 100) / 100);
    onChange(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleIncrement = async () => {
    if (atMax) return;
    const next = Math.min(max, Math.round((value + stepSize) * 100) / 100);
    onChange(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const displayValue = Number.isInteger(value) ? value.toString() : value.toFixed(1);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={[styles.stepButton, atMin && styles.stepButtonDisabled]}
          onPress={handleDecrement}
          disabled={atMin}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepButtonText, atMin && styles.stepButtonTextDisabled]}>-</Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{displayValue}</Text>
          {unit && <Text style={styles.unitText}>{unit}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.stepButton, atMax && styles.stepButtonDisabled]}
          onPress={handleIncrement}
          disabled={atMax}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepButtonText, atMax && styles.stepButtonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: spacing.sm,
  },
  required: {
    color: theme.status.error,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  stepButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  stepButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: theme.text.primary,
  },
  stepButtonTextDisabled: {
    color: theme.text.muted,
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  valueText: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.text.primary,
  },
  unitText: {
    fontSize: 13,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
