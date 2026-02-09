import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutinePlaceholderSectionProps {
  title: string;
  subtitle?: string;
  helper?: string;
}

export function RoutinePlaceholderSection({ title, subtitle, helper }: RoutinePlaceholderSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.dashedBorder}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {helper && <Text style={styles.helper}>{helper}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  dashedBorder: {
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: spacing.lg,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: theme.text.muted,
  },
  helper: {
    fontSize: 12,
    color: theme.text.disabled,
    marginTop: 4,
  },
});
