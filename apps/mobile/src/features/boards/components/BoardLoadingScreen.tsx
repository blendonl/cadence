import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import theme from '@shared/theme';

const COLUMN_COUNT = 3;
const TASK_COUNT_PER_COLUMN = 4;

const BoardLoadingScreen: React.FC = () => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const renderColumnSkeleton = (index: number) => (
    <Animated.View
      key={index}
      style={[styles.column, { opacity: pulseAnim }]}
    >
      <View style={styles.columnHeader}>
        <View style={styles.columnTitle} />
        <View style={styles.columnBadge} />
      </View>

      {Array.from({ length: TASK_COUNT_PER_COLUMN }).map((_, taskIndex) => (
        <View key={taskIndex} style={styles.taskCard}>
          <View style={styles.taskTitle} />
          <View style={styles.taskDescription} />
          <View style={styles.taskFooter}>
            <View style={styles.taskBadge} />
            <View style={styles.taskBadge} />
          </View>
        </View>
      ))}

      <View style={styles.addButton} />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle} />
        <View style={styles.headerButton} />
      </View>

      <View style={styles.columnsContainer}>
        {Array.from({ length: COLUMN_COUNT }).map((_, index) =>
          renderColumnSkeleton(index)
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    width: 120,
    height: 24,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  headerButton: {
    width: 32,
    height: 32,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
  },
  columnsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  column: {
    width: 280,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  columnTitle: {
    width: 100,
    height: 20,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  columnBadge: {
    width: 40,
    height: 20,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 10,
  },
  taskCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  taskTitle: {
    width: '80%',
    height: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  taskDescription: {
    width: '60%',
    height: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  taskBadge: {
    width: 50,
    height: 16,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.sm,
  },
  addButton: {
    height: 40,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
});

export default BoardLoadingScreen;
