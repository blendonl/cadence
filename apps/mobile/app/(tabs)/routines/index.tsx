import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { RoutineType } from 'shared-types';
import { useRoutineByType } from '@features/routines/hooks';
import {
  ROUTINE_TYPE_BADGE_CONFIG,
  ROUTINE_TYPE_GRADIENTS,
} from '@features/routines/constants/routineConstants';
import { formatTargetDisplay } from '@features/routines/utils/routineValidation';
import { Screen } from '@shared/components/Screen';
import GlassCard from '@shared/components/GlassCard';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface HubCardConfig {
  type: RoutineType;
  route: string;
  tagline: string;
  getMetric: () => string | null;
  getStatus: () => 'active' | 'disabled' | 'empty';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function RoutinesHubScreen() {
  const router = useRouter();
  const { sleepRoutine, stepRoutine, otherRoutines, loading } = useRoutineByType();

  const cards: HubCardConfig[] = [
    {
      type: 'SLEEP',
      route: '/routines/sleep',
      tagline: 'Rest & Recovery',
      getMetric: () =>
        sleepRoutine ? formatTargetDisplay('SLEEP', sleepRoutine.target) : null,
      getStatus: () =>
        sleepRoutine ? (sleepRoutine.isActive ? 'active' : 'disabled') : 'empty',
    },
    {
      type: 'STEP',
      route: '/routines/steps',
      tagline: 'Daily Movement',
      getMetric: () =>
        stepRoutine ? formatTargetDisplay('STEP', stepRoutine.target) : null,
      getStatus: () =>
        stepRoutine ? (stepRoutine.isActive ? 'active' : 'disabled') : 'empty',
    },
    {
      type: 'OTHER',
      route: '/routines/other',
      tagline: 'Custom Rituals',
      getMetric: () =>
        otherRoutines.length > 0
          ? `${otherRoutines.length} routine${otherRoutines.length === 1 ? '' : 's'}`
          : null,
      getStatus: () =>
        otherRoutines.length > 0 ? 'active' : 'empty',
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
      {cards.map((card, index) => {
        const config = ROUTINE_TYPE_BADGE_CONFIG[card.type];
        const gradient = ROUTINE_TYPE_GRADIENTS[card.type];
        const metric = card.getMetric();
        const status = card.getStatus();

        return (
          <AnimatedTouchable
            key={card.type}
            entering={FadeInDown.delay(index * 100).duration(500).springify()}
            onPress={() => router.push(card.route as never)}
            activeOpacity={0.85}
          >
            <GlassCard style={styles.glassCard}>
              <View style={styles.cardRow}>
                <View style={[styles.colorBar, { backgroundColor: gradient.accent }]} />

                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={styles.iconContainer}>
                      <AppIcon name={config.icon} size={22} color={gradient.accent} />
                    </View>

                    <View style={styles.titleBlock}>
                      <Text style={styles.cardTitle}>{config.label}</Text>
                      <Text style={styles.cardTagline}>{card.tagline}</Text>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    {status !== 'empty' && (
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                status === 'active'
                                  ? theme.status.success
                                  : theme.text.muted,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                status === 'active'
                                  ? theme.status.success
                                  : theme.text.muted,
                            },
                          ]}
                        >
                          {status === 'active' ? 'Active' : 'Paused'}
                        </Text>
                      </View>
                    )}

                    {metric ? (
                      <Text style={styles.cardMetric}>{metric}</Text>
                    ) : (
                      <Text style={styles.cardEmpty}>Tap to set up</Text>
                    )}

                    <View style={styles.arrowWrap}>
                      <AppIcon name="arrow-right" size={16} color={theme.text.muted} />
                    </View>
                  </View>
                </View>
              </View>
            </GlassCard>
          </AnimatedTouchable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCard: {
    marginBottom: 0,
  },
  cardRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  colorBar: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
  },
  cardContent: {
    flex: 1,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.glass.tint.neutral,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardMetric: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text.secondary,
    flex: 1,
  },
  cardEmpty: {
    fontSize: 14,
    color: theme.text.muted,
    fontStyle: 'italic',
    flex: 1,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
