import React, { useEffect, useState } from 'react';
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
import { RoutineType } from '../domain/entities/Routine';
import {
  validateRoutineTarget,
  getTargetPlaceholder,
  getTargetHelperText,
} from '../domain/utils/routineValidation';
import { WeekdayPicker } from './WeekdayPicker';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineCreateModalProps {
  visible: boolean;
  onClose: () => void;
  lockedType?: RoutineType;
  onSubmit: (
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ) => Promise<void>;
}

const TYPE_BADGE_CONFIG = {
  SLEEP: { label: 'Sleep', icon: '🌙' },
  STEP: { label: 'Steps', icon: '👟' },
  OTHER: { label: 'Other', icon: '📋' },
};

export function RoutineCreateModal({
  visible,
  onClose,
  onSubmit,
  lockedType,
}: RoutineCreateModalProps) {
  const shouldAutoName = lockedType === 'SLEEP' || lockedType === 'STEP';
  const autoName = lockedType === 'SLEEP' ? 'Sleep Routine' : 'Steps Routine';
  const [name, setName] = useState('');
  const [type, setType] = useState<RoutineType>(lockedType || 'OTHER');
  const [target, setTarget] = useState('');
  const [separateInto, setSeparateInto] = useState('1');
  const [repeatIntervalMinutes, setRepeatIntervalMinutes] = useState('1440');
  const [activeDays, setActiveDays] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetError, setTargetError] = useState('');

  useEffect(() => {
    if (lockedType) {
      setType(lockedType);
      setTarget('');
    }
    if (visible && shouldAutoName) {
      setName(autoName);
    }
  }, [autoName, lockedType, shouldAutoName, visible]);

  const handleClose = () => {
    setName('');
    setType(lockedType || 'OTHER');
    setTarget('');
    setSeparateInto('1');
    setRepeatIntervalMinutes('1440');
    setActiveDays(null);
    setLoading(false);
    setError('');
    setTargetError('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');
    setTargetError('');

    const effectiveName = shouldAutoName ? autoName : name;

    if (!effectiveName.trim()) {
      setError('Routine name is required');
      return;
    }

    if (!target.trim()) {
      setTargetError('Target is required');
      return;
    }

    const validation = validateRoutineTarget(type, target);
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
      await onSubmit(
        effectiveName,
        type,
        target,
        type === 'STEP' ? separateIntoNum : undefined,
        repeatNum,
        activeDays || undefined
      );
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (shouldAutoName || name.trim() !== '') && target.trim() !== '' && !loading;

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
          <Text style={styles.title}>Create Routine</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!isFormValid}>
            <Text style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}>
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!shouldAutoName && (
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
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Type *</Text>
            {lockedType ? (
              <View style={styles.lockedType}>
                <Text style={styles.lockedTypeText}>
                  {TYPE_BADGE_CONFIG[lockedType].icon} {TYPE_BADGE_CONFIG[lockedType].label}
                </Text>
              </View>
            ) : (
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'SLEEP' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('SLEEP');
                    setTarget('');
                  }}
                >
                  <Text style={[styles.typeButtonText, type === 'SLEEP' && styles.typeButtonTextActive]}>
                    🌙 Sleep
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'STEP' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('STEP');
                    setTarget('');
                  }}
                >
                  <Text style={[styles.typeButtonText, type === 'STEP' && styles.typeButtonTextActive]}>
                    👟 Steps
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, type === 'OTHER' && styles.typeButtonActive]}
                  onPress={() => {
                    setType('OTHER');
                    setTarget('');
                  }}
                >
                  <Text style={[styles.typeButtonText, type === 'OTHER' && styles.typeButtonTextActive]}>
                    📋 Other
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target *</Text>
            <TextInput
              style={[styles.input, targetError && styles.inputError]}
              value={target}
              onChangeText={setTarget}
              placeholder={getTargetPlaceholder(type)}
              placeholderTextColor={theme.input.placeholder}
            />
            <Text style={styles.helperText}>{getTargetHelperText(type)}</Text>
            {targetError && <Text style={styles.errorText}>{targetError}</Text>}
          </View>

          {type === 'STEP' && (
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
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  lockedType: {
    borderWidth: 1,
    borderColor: theme.border.secondary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: theme.background.elevated,
  },
  lockedTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.accent.primary,
    borderColor: theme.accent.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  typeButtonTextActive: {
    color: theme.text.primary,
    fontWeight: '600',
  },
});
