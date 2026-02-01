import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TaskType } from 'shared-types';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import { TaskDto } from 'shared-types';
import { useTaskScheduleForm } from '../hooks/useTaskScheduleForm';
import { TaskTypePicker } from './TaskTypePicker';
import { FormField } from './ScheduleFormFields';
import { DatePickerField } from './DatePickerField';
import { TimePickerField } from './TimePickerField';
import { DurationPickerField } from './DurationPickerField';
import { getValidationErrors } from '../utils/scheduleValidation';

export interface TaskScheduleData {
  taskId: string;
  date: string;
  time?: string;
  durationMinutes?: number;
  taskType: TaskType;
  isAllDay: boolean;
  location?: string;
  attendees?: string[];
}

interface TaskScheduleModalProps {
  visible: boolean;
  task: TaskDto | null;
  prefilledDate?: string;
  onClose: () => void;
  onSubmit: (data: TaskScheduleData) => Promise<void>;
}

export const TaskScheduleModal: React.FC<TaskScheduleModalProps> = ({
  visible,
  task,
  prefilledDate,
  onClose,
  onSubmit,
}) => {
  const { formData, updateField, reset } = useTaskScheduleForm({
    initialDate: prefilledDate,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && prefilledDate) {
      reset(prefilledDate);
    }
  }, [visible, prefilledDate, reset]);

  const handleSubmit = async () => {
    if (!task) return;

    const hasTime = !!formData.time;
    const scheduleData: TaskScheduleData = {
      taskId: task.id,
      date: formData.date,
      time: hasTime ? formData.time : undefined,
      durationMinutes: hasTime ? formData.durationMinutes : undefined,
      taskType: formData.taskType,
      isAllDay: !hasTime,
      location:
        formData.taskType === TaskType.MEETING && formData.location
          ? formData.location
          : undefined,
      attendees:
        formData.taskType === TaskType.MEETING && formData.attendees
          ? formData.attendees.split(',').map(a => a.trim())
          : undefined,
    };

    const errors = getValidationErrors(scheduleData);
    if (errors.length > 0) {
      Alert.alert('Validation Error', errors[0]);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(scheduleData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  const isMeetingType = formData.taskType === TaskType.MEETING;

  return (
    <BaseModal visible={visible} onClose={onClose} title="Schedule Task" scrollable>
      <TaskInfoCard task={task} />

      <DatePickerField
        label="Date"
        value={formData.date}
        onChange={date => updateField('date', date)}
      />

      <TimePickerField
        label="Time"
        value={formData.time}
        onChange={time => updateField('time', time)}
        onClear={() => {
          updateField('time', '');
          updateField('durationMinutes', undefined);
        }}
      />

      {!!formData.time && (
        <DurationPickerField
          label="Duration"
          value={formData.durationMinutes}
          onChange={minutes => updateField('durationMinutes', minutes)}
        />
      )}

      <View style={styles.formSection}>
        <Text style={styles.label}>Task Type</Text>
        <TaskTypePicker
          value={formData.taskType}
          onChange={type => updateField('taskType', type)}
        />
      </View>

      {isMeetingType && (
        <>
          <FormField
            label="Location"
            value={formData.location}
            onChangeText={text => updateField('location', text)}
            placeholder="Conference Room A"
          />

          <FormField
            label="Attendees (comma-separated)"
            value={formData.attendees}
            onChangeText={text => updateField('attendees', text)}
            placeholder="person@example.com, person2@example.com"
          />
        </>
      )}

      <SubmitButton onPress={handleSubmit} disabled={submitting} />
    </BaseModal>
  );
};

const TaskInfoCard: React.FC<{ task: TaskDto }> = ({ task }) => (
  <View style={styles.taskInfo}>
    <Text style={styles.taskTitle}>{task.title}</Text>
    {task.slug && <Text style={styles.taskProject}>{task.slug}</Text>}
  </View>
);

const SubmitButton: React.FC<{ onPress: () => void; disabled: boolean }> = ({
  onPress,
  disabled,
}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.submitButtonText}>
      {disabled ? 'Scheduling...' : 'Schedule Task'}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  taskInfo: {
    padding: theme.spacing.md,
    backgroundColor: theme.background.elevated,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.border.primary,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: theme.spacing.xs,
  },
  taskProject: {
    fontSize: 13,
    color: theme.text.secondary,
  },
  formSection: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  submitButton: {
    backgroundColor: theme.accent.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.button,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.background.primary,
  },
});
