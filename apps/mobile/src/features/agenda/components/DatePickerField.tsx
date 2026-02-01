import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import { ThemedDatePicker } from '@shared/components/pickers/ThemedDatePicker';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return 'Select date';
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.buttonText}>{formatDateDisplay(value)}</Text>
      </TouchableOpacity>

      <BaseModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        title="Select Date"
        scrollable={false}
      >
        <ThemedDatePicker
          value={value}
          onChange={date => {
            const formatted = date ? date : formatDateString(new Date());
            onChange(formatted);
          }}
          onClose={() => setShowPicker(false)}
        />
      </BaseModal>
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
  button: {
    backgroundColor: theme.background.elevated,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: theme.radius.button,
    padding: theme.spacing.md,
  },
  buttonText: {
    fontSize: 16,
    color: theme.text.primary,
  },
});
