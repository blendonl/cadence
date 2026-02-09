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
import { TaskDto } from "shared-types";
import EmptyState from "@/shared/components/EmptyState";
import BoardHeader from "../(tabs)/boards/components/BoardHeader";
import BoardColumns from "../(tabs)/boards/components/BoardColumns";
import theme from "@/shared/theme";
import uiConstants from "@/shared/theme/uiConstants";

function BoardScreenContent() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const insets = useSafeAreaInsets();
  const [draggedTask, setDraggedTask] = useState<TaskDto | null>(null);

  const {
    board,
    loading,
    columnActions,
    taskActions,
  } = useBoardScreen(boardId);

  const { handleDragStart, handleDragEnd } = useBoardDragDrop({
    onMoveTask: taskActions.handleMoveTask,
  });

  const handleTaskDragStart = useCallback(
    (task: TaskDto) => {
      setDraggedTask(task);
      handleDragStart(task);
    },
    [handleDragStart]
  );

  const bottomPadding = insets.bottom + theme.spacing.lg;

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
