import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import { DatePickerField } from './DatePickerField';
import { TimePickerField } from './TimePickerField';
import { DurationPickerField } from './DurationPickerField';

interface RescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (date: string, time: string | null, duration: number | null) => void;
  initialDate?: string | null;
  initialTime?: string | null;
  initialDuration?: number | null;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialDate,
  initialTime,
  initialDuration,
}) => {
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '');
  const [duration, setDuration] = useState<number | undefined>(initialDuration ?? undefined);

  useEffect(() => {
    if (visible) {
      setDate(initialDate || '');
      setTime(initialTime || '');
      setDuration(initialDuration ?? undefined);
    }
  }, [visible, initialDate, initialTime, initialDuration]);

  const handleSubmit = () => {
    if (!date) return;
    onSubmit(date, time || null, duration ?? null);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Reschedule"
      scrollable={false}
      footer={
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, !date && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!date}
          >
            <Text style={styles.submitText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <DatePickerField
        label="Date"
        value={date}
        onChange={setDate}
      />
      <TimePickerField
        label="Time"
        value={time}
        onChange={setTime}
        onClear={() => setTime('')}
      />
      <DurationPickerField
        label="Duration"
        value={duration}
        onChange={setDuration}
      />
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.button,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  submitButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.button,
    backgroundColor: theme.accent.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.background.primary,
  },
});
