import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '@shared/theme';
import { spacing } from '@shared/theme/spacing';
import AutoRefreshIndicator from '@shared/components/AutoRefreshIndicator';

interface NoteListHeaderProps {
  noteCountLabel: string;
  isAutoRefreshing: boolean;
}

export const NoteListHeader: React.FC<NoteListHeaderProps> = ({
  noteCountLabel,
  isAutoRefreshing,
}) => {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Notes</Text>
        <Text style={styles.headerSubtitle}>{noteCountLabel}</Text>
      </View>
      <View style={styles.headerRight}>
        <AutoRefreshIndicator isRefreshing={isAutoRefreshing} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerText: {
    gap: 6,
  },
  headerTitle: {
    color: theme.text.primary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: theme.text.secondary,
    fontSize: 13,
  },
  headerRight: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
  },
});
