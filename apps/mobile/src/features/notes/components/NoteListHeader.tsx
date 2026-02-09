import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@shared/theme/spacing';
import AutoRefreshIndicator from '@shared/components/AutoRefreshIndicator';

interface NoteListHeaderProps {
  isAutoRefreshing: boolean;
}

export const NoteListHeader: React.FC<NoteListHeaderProps> = ({
  isAutoRefreshing,
}) => {
  return (
    <View style={styles.screenHeader}>
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
  headerRight: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
  },
});
