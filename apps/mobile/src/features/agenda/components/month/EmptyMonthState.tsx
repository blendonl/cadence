import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import AppIcon from '@shared/components/icons/AppIcon';

export const EmptyMonthState: React.FC = () => {
  return (
    <View style={styles.container}>
      <AppIcon name="calendar" size={48} color={theme.text.muted} />
      <Text style={styles.title}>No events this month</Text>
      <Text style={styles.subtitle}>Tap + to schedule a task</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 3,
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: theme.text.secondary,
  },
});
