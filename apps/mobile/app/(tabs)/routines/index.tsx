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
            style={styles.cardWrapper}
            onPress={() => router.push(card.route as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardGradient, { backgroundColor: gradient.bgColor }]}>
              <View style={[styles.glowBorder, { shadowColor: gradient.accent }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <View style={[styles.iconContainer, { backgroundColor: gradient.iconBg }]}>
                    <AppIcon name={config.icon} size={28} color={gradient.accent} />
                  </View>

                  {status !== 'empty' && (
                    <View style={styles.statusRow}>
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
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.cardTitle}>{config.label}</Text>
                  <Text style={[styles.cardTagline, { color: gradient.accent }]}>
                    {card.tagline}
                  </Text>

                  {metric ? (
                    <Text style={styles.cardMetric}>{metric}</Text>
                  ) : (
                    <Text style={styles.cardEmpty}>Tap to set up</Text>
                  )}
                </View>

                <View style={styles.arrowContainer}>
                  <AppIcon name="arrow-right" size={16} color={gradient.accent} />
                </View>
              </View>
            </View>
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
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
    padding: 1,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  cardContent: {
    padding: spacing.xl,
    paddingVertical: 28,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  cardBottom: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardMetric: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text.secondary,
  },
  cardEmpty: {
    fontSize: 14,
    color: theme.text.muted,
    fontStyle: 'italic',
  },
  arrowContainer: {
    position: 'absolute',
    right: spacing.xl,
    bottom: 28,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
