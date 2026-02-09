import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RoutineType } from 'shared-types';
import BaseModal from '@shared/components/BaseModal';
import { PrimaryButton, SecondaryButton } from '@shared/components/Button';
import { RoutineFormFields } from './RoutineFormFields';
import { useRoutineForm } from '../hooks/useRoutineForm';
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

export function RoutineCreateModal({
  visible,
  onClose,
  onSubmit,
  lockedType,
}: RoutineCreateModalProps) {
  const form = useRoutineForm(
    { mode: 'create', lockedType, onSubmit, onClose },
    visible
  );

  return (
    <BaseModal
      visible={visible}
      onClose={form.handleClose}
      title="Create Routine"
      maxHeight="90%"
      footer={
        <View style={styles.footer}>
          <SecondaryButton title="Cancel" onPress={form.handleClose} style={styles.footerButton} />
          <PrimaryButton
            title="Create"
            onPress={form.handleSubmit}
            disabled={!form.isFormValid}
            loading={form.loading}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <RoutineFormFields form={form} mode="create" lockedType={lockedType} />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
