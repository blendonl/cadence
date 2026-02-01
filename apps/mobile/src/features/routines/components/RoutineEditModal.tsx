import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RoutineDetailDto, RoutineUpdateRequestDto } from 'shared-types';
import {
  validateRoutineTarget,
  getTargetPlaceholder,
  getTargetHelperText,
} from '../utils/routineValidation';
import { WeekdayPicker } from './WeekdayPicker';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineEditModalProps {
  visible: boolean;
  routine: RoutineDetailDto | null;
  onClose: () => void;
  onSubmit: (id: string, updates: RoutineUpdateRequestDto) => Promise<void>;
}

export function RoutineEditModal({
  visible,
  routine,
  onClose,
  onSubmit,
}: RoutineEditModalProps) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [separateInto, setSeparateInto] = useState('1');
  const [repeatIntervalMinutes, setRepeatIntervalMinutes] = useState('1440');
  const [activeDays, setActiveDays] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetError, setTargetError] = useState('');

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setTarget(routine.target);
      setSeparateInto(routine.separateInto.toString());
      setRepeatIntervalMinutes(routine.repeatIntervalMinutes.toString());
      setActiveDays(routine.activeDays);
    }
  }, [routine]);

  const handleClose = () => {
    setLoading(false);
    setError('');
    setTargetError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!routine) return;

    setError('');
    setTargetError('');

    if (!name.trim()) {
      setError('Routine name is required');
      return;
    }

    if (!target.trim()) {
      setTargetError('Target is required');
      return;
    }

    const validation = validateRoutineTarget(routine.type, target);
    if (!validation.valid) {
      setTargetError(validation.error || 'Invalid target');
      return;
    }

    const separateIntoNum = parseInt(separateInto, 10);
    if (isNaN(separateIntoNum) || separateIntoNum < 1) {
      setError('Separate Into must be at least 1');
      return;
    }

    const repeatNum = parseInt(repeatIntervalMinutes, 10);
    if (isNaN(repeatNum) || repeatNum < 1) {
      setError('Repeat Interval must be at least 1 minute');
      return;
    }

    setLoading(true);
    try {
      const updates: RoutineUpdateRequestDto = {
        name,
        target,
        repeatIntervalMinutes: repeatNum,
        activeDays: activeDays || undefined,
      };

      if (routine.type === 'STEP') {
        updates.separateInto = separateIntoNum;
      }

      await onSubmit(routine.id, updates);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update routine');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name.trim() !== '' && target.trim() !== '' && !loading;

  if (!routine) return null;

  const TYPE_BADGE_CONFIG = {
    SLEEP: { color: theme.accent.info, label: 'Sleep', icon: '🌙' },
    STEP: { color: theme.accent.success, label: 'Steps', icon: '👟' },
    OTHER: { color: theme.text.muted, label: 'Other', icon: '📋' },
  };

  const badgeConfig = TYPE_BADGE_CONFIG[routine.type];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Routine</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!isFormValid}>
            <Text style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Exercise"
              placeholderTextColor={theme.input.placeholder}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type</Text>
            <View
              style={[
                styles.typeDisabledBadge,
                { backgroundColor: badgeConfig.color + '20', borderColor: badgeConfig.color },
              ]}
            >
              <Text style={[styles.typeDisabledText, { color: badgeConfig.color }]}>
                {badgeConfig.icon} {badgeConfig.label}
              </Text>
            </View>
            <Text style={styles.helperText}>Type cannot be changed after creation</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target *</Text>
            <TextInput
              style={[styles.input, targetError && styles.inputError]}
              value={target}
              onChangeText={setTarget}
              placeholder={getTargetPlaceholder(routine.type)}
              placeholderTextColor={theme.input.placeholder}
            />
            <Text style={styles.helperText}>{getTargetHelperText(routine.type)}</Text>
            {targetError && <Text style={styles.errorText}>{targetError}</Text>}
          </View>

          {routine.type === 'STEP' && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Separate Into</Text>
              <TextInput
                style={styles.input}
                value={separateInto}
                onChangeText={setSeparateInto}
                placeholder="1"
                keyboardType="number-pad"
                placeholderTextColor={theme.input.placeholder}
              />
              <Text style={styles.helperText}>Number of tasks to split the step goal into</Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Repeat Interval (minutes)</Text>
            <TextInput
              style={styles.input}
              value={repeatIntervalMinutes}
              onChangeText={setRepeatIntervalMinutes}
              placeholder="1440"
              keyboardType="number-pad"
              placeholderTextColor={theme.input.placeholder}
            />
            <Text style={styles.helperText}>How often to repeat (1440 = daily)</Text>
          </View>

          <WeekdayPicker
            label="Active Days (optional)"
            value={activeDays}
            onChange={setActiveDays}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.secondary,
    backgroundColor: theme.background.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  submitButton: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.accent.primary,
  },
  submitButtonDisabled: {
    color: theme.text.disabled,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  errorContainer: {
    backgroundColor: `${theme.status.error}26`,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.status.error}66`,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.input.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: theme.input.text,
    backgroundColor: theme.input.background,
  },
  inputError: {
    borderColor: theme.status.error,
  },
  helperText: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
    marginTop: spacing.xs,
  },
  typeDisabledBadge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeDisabledText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
