import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface EmptyRoutinesStateProps {
  onCreatePress: () => void;
}

export function EmptyRoutinesState({ onCreatePress }: EmptyRoutinesStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <AppIcon name="list" size={36} color={theme.text.secondary} />
        </View>
      </View>

      <Text style={styles.title}>No routines yet</Text>
      <Text style={styles.description}>
        Create your first routine to build healthy habits
      </Text>

      <TouchableOpacity style={styles.createButton} onPress={onCreatePress} activeOpacity={0.85}>
        <AppIcon name="add" size={20} color={theme.text.primary} />
        <Text style={styles.createButtonText}>Create Routine</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: theme.glass.tint.neutral,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: theme.text.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: 14,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
