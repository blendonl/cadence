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

export default function SleepRoutineScreen() {
  const { sleepRoutine, loading, refresh } = useRoutineByType();
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
    if (type !== 'SLEEP') {
      alertService.showError('Sleep routine must be a Sleep type.');
      return;
    }
    if (sleepRoutine) {
      alertService.showError('Sleep routine already exists.');
      return;
    }
    await createActions.handleCreateRoutine(
      name,
      'SLEEP',
      target,
      separateInto,
      repeatIntervalMinutes,
      activeDays
    );
  };

  if (loading && !sleepRoutine) {
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
        <Text style={styles.subtitle}>Track your sleep window and patterns.</Text>

        {sleepRoutine ? (
          <>
            <RoutineSummaryCard
              routine={sleepRoutine}
              onEdit={() => modals.openEditModal(sleepRoutine)}
              onToggleStatus={() =>
                editActions.handleToggleStatus(sleepRoutine.id, sleepRoutine.status)
              }
            />

            <RoutinePlaceholderSection
              title="Typical sleep window"
              subtitle="Add patterns from recent logs"
              helper="This section will populate when sleep logs are available."
            />

            <RoutinePlaceholderSection
              title="Recent sleep logs"
              subtitle="No logs yet"
              helper="Sleep sessions will appear here once endpoints are connected."
            />
          </>
        ) : (
          <GlassCard style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌙</Text>
            <Text style={styles.emptyTitle}>Set up your sleep routine</Text>
            <Text style={styles.emptyDescription}>
              Add your usual sleep window to start tracking.
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={modals.openCreateModal}>
              <Text style={styles.primaryButtonText}>Create Sleep Routine</Text>
            </TouchableOpacity>
          </GlassCard>
        )}

        <RoutineCreateModal
          visible={modals.showCreateModal}
          onClose={modals.closeCreateModal}
          onSubmit={handleCreate}
          lockedType="SLEEP"
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
