import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import AppIcon from '@shared/components/icons/AppIcon';
import { ThemedTimePicker } from '@shared/components/pickers/ThemedTimePicker';
import BaseModal from '@shared/components/BaseModal';

interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  onClear: () => void;
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onChange,
  onClear,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatTimeDisplay = (timeString: string): string => {
    if (!timeString) return 'Select time';
    const [hour, minute] = timeString.split(':').map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return timeString;

    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m} ${period}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.pill}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.pillText}>{formatTimeDisplay(value)}</Text>
        </TouchableOpacity>
        {value && (
          <TouchableOpacity style={styles.clearButton} onPress={onClear}>
            <AppIcon name="trash" size={20} color={theme.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <BaseModal
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          title="Pick time"
          scrollable={false}
        >
          <ThemedTimePicker
            value={value}
            onChange={onChange}
            onDone={() => setShowPicker(false)}
          />
        </BaseModal>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  pill: {
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  pillText: {
    fontSize: 14,
    color: theme.text.primary,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
});
