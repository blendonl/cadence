import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskType } from 'shared-types';
import BaseModal from '@shared/components/BaseModal';
import theme from '@shared/theme';
import { Task } from '@features/tasks';
import { useTaskScheduleForm } from '../hooks/useTaskScheduleForm';
import { TaskTypePicker } from './TaskTypePicker';
import { FormField, ToggleField } from './ScheduleFormFields';

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
  task: Task | null;
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
  const { formData, updateField, toggleAllDay, reset } = useTaskScheduleForm({
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

    const scheduleData: TaskScheduleData = {
      taskId: task.id,
      date: formData.date,
      time: formData.isAllDay ? undefined : formData.time,
      durationMinutes: formData.isAllDay ? undefined : formData.durationMinutes,
      taskType: formData.taskType,
      isAllDay: formData.isAllDay,
      location:
        formData.taskType === TaskType.MEETING && formData.location
          ? formData.location
          : undefined,
      attendees:
        formData.taskType === TaskType.MEETING && formData.attendees
          ? formData.attendees.split(',').map(a => a.trim())
          : undefined,
    };

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

      <FormField
        label="Date"
        value={formData.date}
        onChangeText={text => updateField('date', text)}
        placeholder="YYYY-MM-DD"
        keyboardType="numbers-and-punctuation"
      />

      <ToggleField
        label="All day task"
        value={formData.isAllDay}
        onToggle={toggleAllDay}
      />

      {!formData.isAllDay && (
        <>
          <FormField
            label="Time"
            value={formData.time}
            onChangeText={text => updateField('time', text)}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
          />

          <FormField
            label="Duration (minutes)"
            value={formData.durationMinutes.toString()}
            onChangeText={text =>
              updateField('durationMinutes', parseInt(text) || 60)
            }
            placeholder="60"
            keyboardType="number-pad"
          />
        </>
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

const TaskInfoCard: React.FC<{ task: Task }> = ({ task }) => (
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
