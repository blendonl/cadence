import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoutineByType } from '@features/routines/hooks';
import { useRoutineActions } from '@features/routines/hooks/useRoutineActions';
import { useRoutineModals } from '@features/routines/hooks/useRoutineModals';
import { RoutineSummaryCard } from '@features/routines/components/RoutineSummaryCard';
import { RoutinePlaceholderSection } from '@features/routines/components/RoutinePlaceholderSection';
import { RoutineCreateModal } from '@features/routines/components/RoutineCreateModal';
import { RoutineEditModal } from '@features/routines/components/RoutineEditModal';
import alertService from '@/services/AlertService';
import { Screen } from '@shared/components/Screen';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export default function StepsRoutineScreen() {
  const { stepRoutine, loading, refresh } = useRoutineByType();
  const modals = useRoutineModals();

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
    type: 'SLEEP' | 'STEP' | 'OTHER',
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ) => {
    if (type !== 'STEP') {
      alertService.showError('Steps routine must be a Steps type.');
      return;
    }
    if (stepRoutine) {
      alertService.showError('Steps routine already exists.');
      return;
    }
    await createActions.handleCreateRoutine(
      name,
      'STEP',
      target,
      separateInto,
      repeatIntervalMinutes,
      activeDays
    );
  };

  if (loading && !stepRoutine) {
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
        <Text style={styles.subtitle}>Track your daily step goal and progress.</Text>

        {stepRoutine ? (
          <>
            <RoutineSummaryCard
              routine={stepRoutine}
              onEdit={() => modals.openEditModal(stepRoutine)}
              onToggleStatus={() =>
                editActions.handleToggleStatus(stepRoutine.id, stepRoutine.status)
              }
            />

            <RoutinePlaceholderSection
              title="Today's progress"
              subtitle="0 steps logged"
              helper="Progress data will appear when step endpoints are connected."
            />

            <RoutinePlaceholderSection
              title="Weekly trend"
              subtitle="No weekly data yet"
              helper="Weekly charts will appear once history is available."
            />
          </>
        ) : (
          <GlassCard style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👟</Text>
            <Text style={styles.emptyTitle}>Set up your steps routine</Text>
            <Text style={styles.emptyDescription}>
              Add your daily goal and start tracking.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={modals.openCreateModal}>
              <Text style={styles.primaryButtonText}>Create Steps Routine</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        <RoutineCreateModal
          visible={modals.showCreateModal}
          onClose={modals.closeCreateModal}
          onSubmit={handleCreate}
          lockedType="STEP"
        />

        <RoutineEditModal
          visible={modals.showEditModal}
          routine={modals.editingRoutine}
          onClose={modals.closeEditModal}
          onSubmit={editActions.handleUpdateRoutine}
        />
      </ScrollView>
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
  emptyState: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    fontSize: 13,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
