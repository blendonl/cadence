import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { RoutineType } from 'shared-types';
import { useRoutineByType } from '@features/routines/hooks';
import { ROUTINE_TYPE_BADGE_CONFIG } from '@features/routines/constants/routineConstants';
import { Screen } from '@shared/components/Screen';
import GlassCard from '@shared/components/GlassCard';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface HubCardConfig {
  type: RoutineType;
  route: string;
  getDescription: () => string;
}

export default function RoutinesHubScreen() {
  const router = useRouter();
  const { sleepRoutine, stepRoutine, otherRoutines, loading } = useRoutineByType();

  const cards: HubCardConfig[] = [
    {
      type: 'SLEEP',
      route: '/routines/sleep',
      getDescription: () =>
        sleepRoutine
          ? `${sleepRoutine.isActive ? 'Active' : 'Disabled'} \u2022 ${sleepRoutine.target}`
          : 'Set your sleep window and track patterns',
    },
    {
      type: 'STEP',
      route: '/routines/steps',
      getDescription: () =>
        stepRoutine
          ? `${stepRoutine.isActive ? 'Active' : 'Disabled'} \u2022 ${stepRoutine.target} steps`
          : 'Set your daily step goal and view progress',
    },
    {
      type: 'OTHER',
      route: '/routines/other',
      getDescription: () =>
        otherRoutines.length > 0
          ? `${otherRoutines.length} routine${otherRoutines.length === 1 ? '' : 's'} active`
          : 'Build custom routines for everything else',
    },
  ];

  if (loading && !sleepRoutine && !stepRoutine && otherRoutines.length === 0) {
    return (
      <Screen hasTabBar>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen hasTabBar scrollable contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>Choose a routine type to track details and progress.</Text>

      {cards.map(card => {
        const config = ROUTINE_TYPE_BADGE_CONFIG[card.type];
        return (
          <TouchableOpacity
            key={card.type}
            style={styles.card}
            onPress={() => router.push(card.route as never)}
          >
            <GlassCard style={styles.cardInner}>
              <View style={styles.cardHeader}>
                <AppIcon name={config.icon} size={28} color={config.color} />
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{config.label}</Text>
                  <Text style={styles.cardDescription}>{card.getDescription()}</Text>
                </View>
              </View>
              <AppIcon name="arrow-right" size={18} color={theme.text.muted} />
            </GlassCard>
          </TouchableOpacity>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.tertiary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardInner: {
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.text.secondary,
  },
});
