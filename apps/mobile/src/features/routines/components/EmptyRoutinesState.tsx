import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface EmptyRoutinesStateProps {
  onCreatePress: () => void;
}

export function EmptyRoutinesState({ onCreatePress }: EmptyRoutinesStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📋</Text>
      <Text style={styles.title}>No routines yet</Text>
      <Text style={styles.description}>
        Create your first routine to build healthy habits
      </Text>
      <TouchableOpacity style={styles.button} onPress={onCreatePress}>
        <Text style={styles.buttonText}>Create Routine</Text>
      </TouchableOpacity>
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
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: theme.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: theme.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
});
