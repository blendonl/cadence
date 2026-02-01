import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutineByType } from '@features/routines/hooks';
import { useRoutineModals } from '@features/routines/hooks/useRoutineModals';
import { useRoutineActions } from '@features/routines/hooks/useRoutineActions';
import { RoutineListContent } from '@features/routines/components/RoutineListContent';
import { RoutineCreateModal } from '@features/routines/components/RoutineCreateModal';
import { CreateRoutineFAB } from '@features/routines/components/CreateRoutineFAB';
import { RoutineDetailDto } from 'shared-types';
import { Screen } from '@shared/components/Screen';
import theme from '@shared/theme/colors';

export default function OtherRoutinesScreen() {
  const router = useRouter();
  const { otherRoutines, loading, refresh } = useRoutineByType();
  const modals = useRoutineModals();
  const actions = useRoutineActions({
    refreshRoutines: refresh,
    closeModal: modals.closeCreateModal,
  });

  const handleRoutinePress = (routine: RoutineDetailDto) => {
    router.push(`/routines/${routine.id}`);
  };

  if (loading && otherRoutines.length === 0) {
    return (
      <Screen hasTabBar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar>
      <RoutineListContent
        routines={otherRoutines}
        loading={loading}
        onRefresh={refresh}
        onRoutinePress={handleRoutinePress}
        onCreatePress={modals.openCreateModal}
      />

      <CreateRoutineFAB onPress={modals.openCreateModal} />

      <RoutineCreateModal
        visible={modals.showCreateModal}
        onClose={modals.closeCreateModal}
        onSubmit={actions.handleCreateRoutine}
        lockedType="OTHER"
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
});
