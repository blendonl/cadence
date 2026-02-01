import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import theme from '@shared/theme';

const DURATION_PRESETS = [30, 60, 90, 120];

interface DurationPickerFieldProps {
  label: string;
  value: number | undefined;
  onChange: (minutes: number | undefined) => void;
}

export const DurationPickerField: React.FC<DurationPickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const [mode, setMode] = useState<'none' | 'preset' | 'custom'>(
    value === undefined ? 'none' : DURATION_PRESETS.includes(value) ? 'preset' : 'custom'
  );
  const [customValue, setCustomValue] = useState(
    value && !DURATION_PRESETS.includes(value) ? value.toString() : ''
  );

  const handlePresetSelect = (minutes: number) => {
    setMode('preset');
    setCustomValue('');
    onChange(minutes);
  };

  const handleNoneSelect = () => {
    setMode('none');
    setCustomValue('');
    onChange(undefined);
  };

  const handleCustomSelect = () => {
    setMode('custom');
    if (!customValue) {
      setCustomValue('');
      onChange(undefined);
    }
  };

  const handleCustomChange = (text: string) => {
    setCustomValue(text);
    const parsed = parseInt(text);
    if (text === '') {
      onChange(undefined);
    } else if (!isNaN(parsed) && parsed > 0) {
      onChange(parsed);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pillRow}>
        <TouchableOpacity
          style={[styles.pill, mode === 'none' && styles.pillSelected]}
          onPress={handleNoneSelect}
        >
          <Text style={[styles.pillText, mode === 'none' && styles.pillTextSelected]}>
            None
          </Text>
        </TouchableOpacity>
        {DURATION_PRESETS.map(minutes => (
          <TouchableOpacity
            key={`dur-${minutes}`}
            style={[
              styles.pill,
              mode === 'preset' && value === minutes && styles.pillSelected,
            ]}
            onPress={() => handlePresetSelect(minutes)}
          >
            <Text
              style={[
                styles.pillText,
                mode === 'preset' && value === minutes && styles.pillTextSelected,
              ]}
            >
              {minutes}m
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.pill, mode === 'custom' && styles.pillSelected]}
          onPress={handleCustomSelect}
        >
          <Text style={[styles.pillText, mode === 'custom' && styles.pillTextSelected]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'custom' && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            value={customValue}
            onChangeText={handleCustomChange}
            keyboardType="number-pad"
            placeholder="Minutes"
            placeholderTextColor={theme.text.muted}
          />
          <Text style={styles.helperText}>min</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pill: {
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  pillSelected: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  pillText: {
    fontSize: 14,
    color: theme.text.primary,
  },
  pillTextSelected: {
    color: theme.background.primary,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: theme.radius.button,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.text.primary,
  },
  helperText: {
    fontSize: 14,
    color: theme.text.muted,
  },
});
