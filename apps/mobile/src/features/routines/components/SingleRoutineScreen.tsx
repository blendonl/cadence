import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import AppIcon from '@shared/components/icons/AppIcon';
import {
  ROUTINE_TYPE_BADGE_CONFIG,
  ROUTINE_TYPE_GRADIENTS,
} from '../constants/routineConstants';
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

  const config = ROUTINE_TYPE_BADGE_CONFIG[routineType];
  const gradient = ROUTINE_TYPE_GRADIENTS[routineType];

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
      alertService.showError(`${config.label} routine must be a ${config.label} type.`);
      return;
    }
    if (routine) {
      alertService.showError(`${config.label} routine already exists.`);
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
          <ActivityIndicator size="large" color={gradient.accent} />
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
            tintColor={gradient.accent}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <AppIcon name={config.icon} size={28} color={gradient.accent} />
          </View>
          <Text style={styles.heroTitle}>{config.label}</Text>
          <Text style={styles.heroSubtitle}>{subtitle}</Text>
        </View>

        {routine && (
          <Animated.View entering={FadeInDown.duration(400).springify()}>
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
          </Animated.View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 28,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
    textAlign: 'center',
  },
});
