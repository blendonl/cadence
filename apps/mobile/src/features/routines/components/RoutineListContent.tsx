import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Routine } from '../domain/entities/Routine';
import { RoutineCard } from './RoutineCard';
import { EmptyRoutinesState } from './EmptyRoutinesState';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';

interface RoutineListContentProps {
  routines: Routine[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onRoutinePress: (routine: Routine) => void;
  onCreatePress: () => void;
}

export function RoutineListContent({
  routines,
  loading,
  onRefresh,
  onRoutinePress,
  onCreatePress,
}: RoutineListContentProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (!loading && routines.length === 0) {
    return <EmptyRoutinesState onCreatePress={onCreatePress} />;
  }

  return (
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RoutineCard routine={item} onPress={onRoutinePress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent.primary}
          />
        }
      />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
