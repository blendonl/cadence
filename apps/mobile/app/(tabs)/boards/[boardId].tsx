import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocalSearchParams } from "expo-router";
import { useBoardScreen } from "@/features/boards/hooks";
import { useBoardDragDrop } from "@/features/boards/hooks/useBoardDragDrop";
import { BoardDragProvider } from "@/features/boards/components/drag-drop";
import { Task } from "@/features/tasks/domain/entities/Task";
import EmptyState from "@/shared/components/EmptyState";
import BoardHeader from "./components/BoardHeader";
import BoardColumns from "./components/BoardColumns";
import theme from "@/shared/theme";
import uiConstants from "@/shared/theme/uiConstants";

function BoardScreenContent() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const insets = useSafeAreaInsets();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const {
    board,
    loading,
    columnActions,
    taskActions,
  } = useBoardScreen(boardId);

  const { handleDragStart, handleDragEnd } = useBoardDragDrop({
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

  const handleTaskDragStart = useCallback(
    (task: Task) => {
      setDraggedTask(task);
      handleDragStart(task);
    },
    [handleDragStart]
  );

  const bottomPadding =
    uiConstants.TAB_BAR_HEIGHT +
    uiConstants.TAB_BAR_BOTTOM_MARGIN +
    insets.bottom +
    theme.spacing.lg;

  if (loading || !board) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading board...</Text>
        </View>
      </View>
    );
  }

  if (!board.columns || board.columns.length === 0) {
    return (
      <EmptyState
        title="No Columns"
        message="This board doesn't have any columns yet. Add columns through the desktop app."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <BoardHeader description={board.description} />

      <BoardColumns
        columns={board.columns!}
        bottomPadding={bottomPadding}
        onTaskPress={taskActions.handleTaskPress}
        onDragStart={handleTaskDragStart}
        onDragEnd={handleDragEnd}
        onAddTask={taskActions.handleAddTask}
        draggedTask={draggedTask}
      />
    </SafeAreaView>
  );
}

export default function BoardScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BoardDragProvider>
        <BoardScreenContent />
      </BoardDragProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...theme.typography.textStyles.body,
    color: theme.text.secondary,
  },
});
