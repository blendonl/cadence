import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '@shared/components/GlassCard';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutinePlaceholderSectionProps {
  title: string;
  subtitle?: string;
  helper?: string;
}

export function RoutinePlaceholderSection({ title, subtitle, helper }: RoutinePlaceholderSectionProps) {
  return (
    <GlassCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {helper && <Text style={styles.helper}>{helper}</Text>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: spacing.xs,
  },
  helper: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
});
