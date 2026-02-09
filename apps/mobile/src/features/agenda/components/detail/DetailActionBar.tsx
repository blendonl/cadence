import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Button } from '@shared/components/Button';
import { useCompletionAnimation } from '@features/agenda/hooks/useCompletionAnimation';
import { ActionLoadingState } from '@features/agenda/hooks/useAgendaItemDetail';

interface DetailActionBarProps {
  isCompleted: boolean;
  actionLoading: ActionLoadingState;
  onToggleComplete: () => void;
  onReschedule: () => void;
  onDelete: () => void;
}

export const DetailActionBar: React.FC<DetailActionBarProps> = ({
  isCompleted,
  actionLoading,
  onToggleComplete,
  onReschedule,
  onDelete,
}) => {
  const { scale, triggerCompletion } = useCompletionAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleComplete = async () => {
    if (!isCompleted) {
      await triggerCompletion();
    }
    onToggleComplete();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Button
          title={isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          onPress={handleToggleComplete}
          variant={isCompleted ? 'secondary' : 'success'}
          loading={actionLoading === 'complete'}
          fullWidth
        />
      </Animated.View>

      <View style={styles.secondaryRow}>
        <Button
          title="Reschedule"
          onPress={onReschedule}
          variant="secondary"
          loading={actionLoading === 'reschedule'}
          style={styles.halfButton}
        />
        <Button
          title="Delete"
          onPress={onDelete}
          variant="danger"
          loading={actionLoading === 'delete'}
          style={styles.halfButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});
