import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIcon from '@shared/components/icons/AppIcon';
import { PrimaryButton } from '@shared/components/Button';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface EmptyRoutinesStateProps {
  onCreatePress: () => void;
}

export function EmptyRoutinesState({ onCreatePress }: EmptyRoutinesStateProps) {
  return (
    <View style={styles.container}>
      <AppIcon name="list" size={64} color={theme.text.muted} />
      <Text style={styles.title}>No routines yet</Text>
      <Text style={styles.description}>
        Create your first routine to build healthy habits
      </Text>
      <PrimaryButton title="Create Routine" onPress={onCreatePress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
  },
  description: {
    fontSize: 14,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
