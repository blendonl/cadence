import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RoutineType } from 'shared-types';
import { Input } from '@shared/components/Input';
import NumericStepper from '@shared/components/NumericStepper';
import AppIcon from '@shared/components/icons/AppIcon';
import { WeekdayPicker } from './WeekdayPicker';
import { RepeatIntervalPicker } from './RepeatIntervalPicker';
import { StepTargetInput } from './StepTargetInput';
import { SleepWindowPicker } from './SleepWindowPicker';
import {
  ROUTINE_TYPE_BADGE_CONFIG,
  SEPARATE_INTO_RANGE,
} from '../constants/routineConstants';
import { getTargetPlaceholder, getTargetHelperText } from '../utils/routineValidation';
import { UseRoutineFormReturn } from '../hooks/useRoutineForm';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineFormFieldsProps {
  form: UseRoutineFormReturn;
  mode: 'create' | 'edit';
  lockedType?: RoutineType;
}

const ROUTINE_TYPES: RoutineType[] = ['SLEEP', 'STEP', 'OTHER'];

export function RoutineFormFields({ form, mode, lockedType }: RoutineFormFieldsProps) {
  const { values, errors, setField, shouldAutoName, isFixedDaily } = form;
  const isEdit = mode === 'edit';

  return (
    <View>
      {errors.general !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errors.general}</Text>
        </View>
      )}

      {!shouldAutoName && (
        <Input
          label="Name"
          required
          value={values.name}
          onChangeText={(text: string) => setField('name', text)}
          placeholder="e.g., Morning Exercise"
          error={errors.general.includes('name') ? errors.general : undefined}
        />
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>{isEdit ? 'Type' : 'Type *'}</Text>
        {isEdit || lockedType ? (
          <>
            <TypeBadge type={values.type} />
            {isEdit && (
              <Text style={styles.helperText}>Type cannot be changed after creation</Text>
            )}
          </>
        ) : (
          <View style={styles.typeButtons}>
            {ROUTINE_TYPES.map(t => {
              const config = ROUTINE_TYPE_BADGE_CONFIG[t];
              const isActive = values.type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeButton, isActive && styles.typeButtonActive]}
                  onPress={() => {
                    setField('type', t);
                    setField('target', '');
                  }}
                >
                  <AppIcon name={config.icon} size={16} color={isActive ? theme.text.primary : theme.text.secondary} />
                  <Text style={[styles.typeButtonText, isActive && styles.typeButtonTextActive]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {values.type === 'SLEEP' && (
        <SleepWindowPicker
          value={values.target}
          onChange={v => setField('target', v)}
          error={errors.target || undefined}
        />
      )}

      {values.type === 'STEP' && (
        <StepTargetInput
          value={values.target}
          onChange={v => setField('target', v)}
          label="Step Target"
          required
          error={errors.target || undefined}
        />
      )}

      {values.type === 'OTHER' && (
        <Input
          label="Target"
          required
          value={values.target}
          onChangeText={(text: string) => setField('target', text)}
          placeholder={getTargetPlaceholder(values.type)}
          hint={getTargetHelperText(values.type)}
          error={errors.target || undefined}
          keyboardType="number-pad"
        />
      )}

      {values.type === 'STEP' && (
        <NumericStepper
          label="Separate Into"
          value={values.separateInto}
          onChange={v => setField('separateInto', v)}
          min={SEPARATE_INTO_RANGE.min}
          max={SEPARATE_INTO_RANGE.max}
          step={SEPARATE_INTO_RANGE.step}
          unit="tasks"
          hint="Number of tasks to split the step goal into"
        />
      )}

      {!isFixedDaily && (
        <>
          <RepeatIntervalPicker
            value={values.repeatIntervalMinutes}
            onChange={v => setField('repeatIntervalMinutes', v)}
          />

          <WeekdayPicker
            label="Active Days (optional)"
            value={values.activeDays}
            onChange={days => setField('activeDays', days)}
          />
        </>
      )}
    </View>
  );
}

function TypeBadge({ type }: { type: RoutineType }) {
  const config = ROUTINE_TYPE_BADGE_CONFIG[type];
  return (
    <View style={[styles.typeBadge, { backgroundColor: config.color + '20', borderColor: config.color }]}>
      <AppIcon name={config.icon} size={16} color={config.color} />
      <Text style={[styles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: `${theme.status.error}26`,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.status.error}66`,
  },
  errorText: {
    fontSize: 12,
    color: theme.status.error,
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
  helperText: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    backgroundColor: theme.background.elevated,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
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
  typeBadge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  typeBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
