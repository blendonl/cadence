import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRoutineDetail } from '@features/routines/hooks/useRoutineDetail';
import { useRoutineModals } from '@features/routines/hooks/useRoutineModals';
import { useRoutineActions } from '@features/routines/hooks/useRoutineActions';
import { RoutineDetailContent } from '@features/routines/components/RoutineDetailContent';
import { RoutineEditModal } from '@features/routines/components/RoutineEditModal';
import { Screen } from '@shared/components/Screen';
import theme from '@shared/theme/colors';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { routine, loading, error, refresh } = useRoutineDetail(routineId);
  const modals = useRoutineModals();
  const actions = useRoutineActions({
    refreshRoutines: refresh,
    closeModal: modals.closeEditModal,
  });

  const handleEdit = () => {
    if (routine) {
      modals.openEditModal(routine);
    }
  };

  const handleDelete = async () => {
    if (routine) {
      await actions.handleDeleteRoutine(routine.id);
      router.back();
    }
  };

  const handleToggleStatus = async () => {
    if (routine) {
      await actions.handleToggleStatus(routine.id, routine.status);
    }
  };

  if (loading) {
    return (
      <Screen hasTabBar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !routine) {
    return (
      <Screen hasTabBar>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Routine not found'}
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <RoutineDetailContent
        routine={routine}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <RoutineEditModal
        visible={modals.showEditModal}
        routine={modals.editingRoutine}
        onClose={modals.closeEditModal}
        onSubmit={actions.handleUpdateRoutine}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.status.error,
    textAlign: 'center',
  },
});
