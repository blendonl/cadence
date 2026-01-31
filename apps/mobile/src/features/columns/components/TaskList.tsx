import React, { useCallback, forwardRef } from 'react';
import {
  FlatList,
  StyleSheet,
  ListRenderItem,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  View,
} from 'react-native';
import { TaskDto } from 'shared-types';
import { Parent } from '@domain/entities/Parent';
import { DraggableTaskCard } from '@features/boards/components/drag-drop';
import theme from '@shared/theme';

interface TaskListProps {
  tasks: TaskDto[];
  parents?: Parent[];
  onTaskPress: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onContentSizeChange?: (width: number, height: number) => void;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoadingMore?: boolean;
}

const TaskList = React.memo(forwardRef<FlatList, TaskListProps>(({
  tasks,
  parents = [],
  onTaskPress,
  onDragStart,
  onDragEnd,
  onContentSizeChange,
  onScroll,
  scrollEventThrottle,
  onEndReached,
  onEndReachedThreshold = 0.5,
  isLoadingMore = false,
}, ref) => {
  const getTaskParent = useCallback((task: TaskDto): Parent | undefined => {
    if (!task.parentId) return undefined;
    return parents.find((p) => p.id === task.parentId);
  }, [parents]);

  const renderTask: ListRenderItem<TaskDto> = useCallback(
    ({ item: task }) => (
      <DraggableTaskCard
        task={task}
        parent={getTaskParent(task)}
        onPress={() => onTaskPress(task)}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    ),
    [onTaskPress, onDragStart, onDragEnd, getTaskParent]
  );

  const keyExtractor = useCallback((task: TaskDto) => task.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 80,
      offset: 80 * index,
      index,
    }),
    []
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.accent.primary} />
      </View>
    );
  }, [isLoadingMore]);

  return (
    <FlatList
      ref={ref}
      data={tasks}
      renderItem={renderTask}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      contentContainerStyle={styles.container}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      onContentSizeChange={onContentSizeChange}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
    />
  );
}));

TaskList.displayName = 'TaskList';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm,
  },
  loadingFooter: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TaskList;
