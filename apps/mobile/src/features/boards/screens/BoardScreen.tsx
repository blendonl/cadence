import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, ListRenderItem } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from '@shared/types/navigation';
import { useBoardScreen } from '@features/boards/hooks';
import { useBoardDragDrop } from '@features/boards/hooks/useBoardDragDrop';
import { useAutoScroll } from '@features/boards/hooks/useAutoScroll';
import { BoardDragProvider, DragOverlay, DroppableColumn, useBoardDrag } from '@features/boards/components/drag-drop';
import { AddColumnCard } from '@features/columns/components';
import { useColumnFormModal } from '@features/columns/hooks';
import { Task } from '@features/tasks/domain/entities/Task';
import EmptyState from '@shared/components/EmptyState';
import theme from '@shared/theme';
import uiConstants from '@shared/theme/uiConstants';

type BoardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Board'>;
type BoardScreenRouteProp = RouteProp<RootStackParamList, 'Board'>;

interface Props {
  navigation: BoardScreenNavigationProp;
  route: BoardScreenRouteProp;
}

function BoardScreenContent({ navigation, route }: Props) {
  const { boardId } = route.params;
  const insets = useSafeAreaInsets();
  const boardListRef = useRef<FlatList>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragContext = useBoardDrag();

  const {
    board,
    loading,
    refreshing,
    error,
    isAutoRefreshing,
    columnActions,
    taskActions,
    viewState,
    refreshBoard,
    retryLoad,
  } = useBoardScreen(boardId);

  useEffect(() => {
    if (boardListRef.current) {
      dragContext.setHorizontalScrollRef(boardListRef);
    }
  }, [dragContext]);

  const {
    handleHorizontalScroll,
    handleHorizontalContentSize,
    handleHorizontalLayout,
    registerVerticalScroll,
    unregisterVerticalScroll,
  } = useAutoScroll({
    dragPosition: dragContext.dragPosition,
    isDragging: dragContext.isDragging,
    activeColumnId: dragContext.activeColumnId,
    horizontalScrollRef: boardListRef,
  });

  const { handleDragStart, handleDragEnd, validateDrop } = useBoardDragDrop({
    board,
    onMoveTask: taskActions.handleMoveTask,
    onValidateMove: async (board, taskId, targetColumnId) => {
      const targetColumn = board.getColumnById(targetColumnId);
      const task = board.getTaskById(taskId);

      if (!targetColumn || !task) {
        return { valid: false, reason: 'Column or task not found' };
      }

      if (task.columnId === targetColumnId) {
        return { valid: false, reason: 'Task is already in this column' };
      }

      if (targetColumn.limit !== null && targetColumn.tasks.length >= targetColumn.limit) {
        return { valid: false, reason: `Column "${targetColumn.name}" is at WIP limit (${targetColumn.limit})` };
      }

      return { valid: true };
    },
  });

  const columnFormModal = useColumnFormModal({
    onSubmit: async (name, wipLimit, columnId) => {
      if (columnId) {
        await columnActions.handleUpdateColumn(columnId, { name, limit: wipLimit ?? null });
      } else {
        await columnActions.handleCreateColumn(name, wipLimit);
      }
    },
  });

  React.useEffect(() => {
    if (board) {
      navigation.setOptions({ title: board.name });
    }
  }, [board, navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshBoard();
    });
    return unsubscribe;
  }, [navigation, refreshBoard]);

  const handleTaskPress = useCallback(
    (task: any) => taskActions.handleTaskPress(task),
    [taskActions]
  );

  const handleTaskDragStart = useCallback(
    (task: Task) => {
      setDraggedTaskId(task.id);
      handleDragStart(task);
    },
    [handleDragStart]
  );

  useEffect(() => {
    setDraggedTaskId(null);
  }, [board]);

  const currentDraggedTask = useMemo(() => {
    if (!draggedTaskId || !board) return null;
    return board.getTaskById(draggedTaskId);
  }, [draggedTaskId, board]);

  const handleAddTask = useCallback(
    (columnId: string) => taskActions.handleAddTask(columnId),
    [taskActions]
  );

  const handleColumnMenu = useCallback(
    (column: any) => columnFormModal.openForEdit(column),
    [columnFormModal]
  );

  const renderColumn: ListRenderItem<any> = useCallback(
    ({ item: column }) => (
      <DroppableColumn
        column={column}
        showParentGroups={viewState.showParentGroups}
        onTaskPress={handleTaskPress}
        onDragStart={handleTaskDragStart}
        onDragEnd={handleDragEnd}
        onAddTask={() => handleAddTask(column.id)}
        onColumnMenu={() => handleColumnMenu(column)}
        onValidateDrop={validateDrop}
        registerVerticalScroll={registerVerticalScroll}
        unregisterVerticalScroll={unregisterVerticalScroll}
      />
    ),
    [viewState.showParentGroups, handleTaskPress, handleTaskDragStart, handleDragEnd, handleAddTask, handleColumnMenu, validateDrop, registerVerticalScroll, unregisterVerticalScroll]
  );

  const keyExtractor = useCallback((column: any) => column.id, []);

  const ListFooterMemoized = useMemo(
    () => <AddColumnCard onPress={columnFormModal.openForCreate} />,
    [columnFormModal.openForCreate]
  );

  const bottomPadding = useMemo(
    () =>
      uiConstants.TAB_BAR_HEIGHT +
      uiConstants.TAB_BAR_BOTTOM_MARGIN +
      insets.bottom +
      theme.spacing.lg,
    [insets.bottom]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !board) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <EmptyState
          title="Failed to load board"
          message={error.message}
          actionLabel="Retry"
          onAction={retryLoad}
        />
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <EmptyState
          title="Board not found"
          message="This board may have been deleted"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <FlatList
        ref={boardListRef}
        horizontal
        data={board.columns}
        keyExtractor={keyExtractor}
        renderItem={renderColumn}
        ListFooterComponent={ListFooterMemoized}
        contentContainerStyle={[
          styles.columnList,
          { paddingBottom: bottomPadding },
        ]}
        showsHorizontalScrollIndicator={false}
        onLayout={(event) => {
          handleHorizontalLayout(event.nativeEvent.layout.width);
        }}
        onContentSizeChange={(width) => {
          handleHorizontalContentSize(width);
        }}
        onScroll={(event) => {
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
          handleHorizontalScroll(
            contentOffset.x,
            contentSize?.width,
            layoutMeasurement?.width,
          );
        }}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isAutoRefreshing}
            onRefresh={refreshBoard}
            tintColor={theme.accent.primary}
          />
        }
      />
      <DragOverlay task={currentDraggedTask} />
    </SafeAreaView>
  );
}

export default function BoardScreen(props: Props) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BoardDragProvider>
        <BoardScreenContent {...props} />
      </BoardDragProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnList: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
  },
});
