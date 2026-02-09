import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { RoutineType } from 'shared-types';
import { useRoutineByType } from '../hooks';
import { useRoutineActions } from '../hooks/useRoutineActions';
import { useRoutineModals } from '../hooks/useRoutineModals';
import { RoutineSummaryCard } from './RoutineSummaryCard';
import { RoutinePlaceholderSection } from './RoutinePlaceholderSection';
import { RoutineCreateModal } from './RoutineCreateModal';
import { RoutineEditModal } from './RoutineEditModal';
import alertService from '@/services/AlertService';
import { Screen } from '@shared/components/Screen';
import { ROUTINE_TYPE_BADGE_CONFIG } from '../constants/routineConstants';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface PlaceholderConfig {
  title: string;
  subtitle: string;
  helper: string;
}

interface SingleRoutineScreenProps {
  routineType: RoutineType;
  subtitle: string;
  placeholders: PlaceholderConfig[];
}

export function SingleRoutineScreen({
  routineType,
  subtitle,
  placeholders,
}: SingleRoutineScreenProps) {
  const routineData = useRoutineByType();
  const routineOrNull =
    routineType === 'SLEEP' ? routineData.sleepRoutine :
    routineType === 'STEP' ? routineData.stepRoutine :
    null;
  const routine = routineOrNull ?? undefined;
  const { loading, refresh } = routineData;
  const modals = useRoutineModals();

  useEffect(() => {
    if (!loading && !routine) {
      modals.openCreateModal();
    }
  }, [loading, routine]);

  const createActions = useRoutineActions({
    refreshRoutines: refresh,
    closeModal: modals.closeCreateModal,
  });

  const editActions = useRoutineActions({
    refreshRoutines: refresh,
    closeModal: modals.closeEditModal,
  });

  const handleCreate = async (
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ) => {
    if (type !== routineType) {
      alertService.showError(`${ROUTINE_TYPE_BADGE_CONFIG[routineType].label} routine must be a ${ROUTINE_TYPE_BADGE_CONFIG[routineType].label} type.`);
      return;
    }
    if (routine) {
      alertService.showError(`${ROUTINE_TYPE_BADGE_CONFIG[routineType].label} routine already exists.`);
      return;
    }
    await createActions.handleCreateRoutine(
      name,
      routineType,
      target,
      separateInto,
      repeatIntervalMinutes,
      activeDays
    );
  };

  if (loading && !routine) {
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.accent.primary}
          />
        }
      >
        <Text style={styles.subtitle}>{subtitle}</Text>

        {routine && (
          <>
            <RoutineSummaryCard
              routine={routine}
              onEdit={() => modals.openEditModal(routine)}
              onToggleStatus={() =>
                editActions.handleToggleStatus(routine.id, routine.status)
              }
            />
            {placeholders.map((p, i) => (
              <RoutinePlaceholderSection
                key={i}
                title={p.title}
                subtitle={p.subtitle}
                helper={p.helper}
              />
            ))}
          </>
        )}
      </ScrollView>

      <RoutineCreateModal
        visible={modals.showCreateModal}
        onClose={modals.closeCreateModal}
        onSubmit={handleCreate}
        lockedType={routineType}
      />

      <RoutineEditModal
        visible={modals.showEditModal}
        routine={modals.editingRoutine}
        onClose={modals.closeEditModal}
        onSubmit={editActions.handleUpdateRoutine}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.tertiary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
