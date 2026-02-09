import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RoutineDetailDto, RoutineUpdateRequestDto } from 'shared-types';
import BaseModal from '@shared/components/BaseModal';
import { PrimaryButton, SecondaryButton } from '@shared/components/Button';
import { RoutineFormFields } from './RoutineFormFields';
import { useRoutineForm } from '../hooks/useRoutineForm';
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
  const form = useRoutineForm(
    { mode: 'edit', routine, onSubmit, onClose },
    visible
  );

  if (!routine) return null;

  return (
    <BaseModal
      visible={visible}
      onClose={form.handleClose}
      title="Edit Routine"
      maxHeight="90%"
      footer={
        <View style={styles.footer}>
          <SecondaryButton title="Cancel" onPress={form.handleClose} style={styles.footerButton} />
          <PrimaryButton
            title="Save"
            onPress={form.handleSubmit}
            disabled={!form.isFormValid}
            loading={form.loading}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <RoutineFormFields form={form} mode="edit" />
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
