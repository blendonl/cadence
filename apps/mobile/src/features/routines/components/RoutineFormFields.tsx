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
  ROUTINE_TYPE_GRADIENTS,
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
    <View style={styles.form}>
      {errors.general !== '' && (
        <View style={styles.errorBanner}>
          <AppIcon name="alert" size={14} color={theme.status.error} />
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

      {lockedType !== 'SLEEP' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{isEdit ? 'Type' : 'Type *'}</Text>
          {isEdit || lockedType ? (
            <TypeBadge type={values.type} />
          ) : (
            <View style={styles.typeSelector}>
              {ROUTINE_TYPES.map(t => {
                const config = ROUTINE_TYPE_BADGE_CONFIG[t];
                const gradient = ROUTINE_TYPE_GRADIENTS[t];
                const isActive = values.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeCard,
                      isActive && {
                        backgroundColor: gradient.iconBg,
                        borderColor: gradient.accent + '40',
                      },
                    ]}
                    onPress={() => {
                      setField('type', t);
                      setField('target', '');
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.typeIconWrap,
                        { backgroundColor: isActive ? gradient.accent + '25' : 'rgba(255,255,255,0.04)' },
                      ]}
                    >
                      <AppIcon
                        name={config.icon}
                        size={20}
                        color={isActive ? gradient.accent : theme.text.muted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.typeLabel,
                        isActive && { color: gradient.accent },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

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
  const gradient = ROUTINE_TYPE_GRADIENTS[type];
  return (
    <View style={[styles.typeBadge, { backgroundColor: gradient.iconBg }]}>
      <AppIcon name={config.icon} size={18} color={gradient.accent} />
      <Text style={[styles.typeBadgeText, { color: gradient.accent }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 0,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(242, 107, 107, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242, 107, 107, 0.15)',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 13,
    color: theme.status.error,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 14,
    backgroundColor: theme.background.elevated,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  typeBadge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  typeBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
