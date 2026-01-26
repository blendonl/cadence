import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useRoutineByType } from '@features/routines/hooks';
import { Screen } from '@shared/components/Screen';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

export default function RoutinesHubScreen() {
  const router = useRouter();
  const { sleepRoutine, stepRoutine, otherRoutines, loading } = useRoutineByType();

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

      <TouchableOpacity style={styles.card} onPress={() => router.push('/routines/sleep')}>
        <GlassCard style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🌙</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Sleep</Text>
              <Text style={styles.cardDescription}>
                {sleepRoutine
                  ? `${sleepRoutine.isActive ? 'Active' : 'Disabled'} • ${sleepRoutine.target}`
                  : 'Set your sleep window and track patterns'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </GlassCard>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/routines/steps')}>
        <GlassCard style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👟</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Steps</Text>
              <Text style={styles.cardDescription}>
                {stepRoutine
                  ? `${stepRoutine.isActive ? 'Active' : 'Disabled'} • ${stepRoutine.target} steps`
                  : 'Set your daily step goal and view progress'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </GlassCard>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/routines/other')}>
        <GlassCard style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Other</Text>
              <Text style={styles.cardDescription}>
                {otherRoutines.length > 0
                  ? `${otherRoutines.length} routine${otherRoutines.length === 1 ? '' : 's'} active`
                  : 'Build custom routines for everything else'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardChevron}>›</Text>
        </GlassCard>
      </TouchableOpacity>
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
  cardIcon: {
    fontSize: 28,
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
  cardChevron: {
    fontSize: 24,
    color: theme.text.muted,
    marginLeft: spacing.sm,
  },
});
