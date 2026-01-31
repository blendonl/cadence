import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { BoardColumnDto, TaskDto } from "shared-types";
import { Parent } from "@domain/entities/Parent";
import { useColumnGrouping } from "../hooks/useColumnGrouping";
import ColumnHeader from "./ColumnHeader";
import TaskList from "./TaskList";
import GroupedTaskList from "./GroupedTaskList";
import theme from "@shared/theme";

interface ColumnCardProps {
  column: BoardColumnDto;
  tasks: TaskDto[];
  parents?: Parent[];
  showParentGroups?: boolean;
  onTaskPress: (task: TaskDto) => void;
  onTaskLongPress?: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onAddTask: () => void;
  onColumnMenu?: () => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  registerVerticalScroll?: (
    columnId: string,
    ref: React.RefObject<FlatList | null>,
    contentHeight: number,
    viewportHeight: number,
  ) => void;
  handleVerticalScroll?: (columnId: string, offset: number) => void;
  unregisterVerticalScroll?: (columnId: string) => void;
}

const ColumnCard: React.FC<ColumnCardProps> = React.memo(
  ({
    column,
    tasks,
    parents = [],
    showParentGroups = false,
    onTaskPress,
    onTaskLongPress,
    onDragStart,
    onDragEnd,
    onAddTask,
    onColumnMenu,
    onLoadMore,
    isLoadingMore = false,
    hasMore = false,
    registerVerticalScroll,
    handleVerticalScroll,
    unregisterVerticalScroll,
  }) => {
    const taskListRef = useRef<FlatList>(null);
    const [contentSize, setContentSize] = useState({ height: 0, width: 0 });
    const [viewportHeight, setViewportHeight] = useState(0);

    const { groupedTasks, totalTaskCount } = useColumnGrouping({
      tasks,
      parents,
      showParentGroups,
      sortByPriority: false,
    });

    useEffect(() => {
      if (registerVerticalScroll && !showParentGroups) {
        registerVerticalScroll(
          column.id,
          taskListRef,
          contentSize.height,
          viewportHeight,
        );
      }

      return () => {
        if (unregisterVerticalScroll) {
          unregisterVerticalScroll(column.id);
        }
      };
    }, [
      column.id,
      registerVerticalScroll,
      unregisterVerticalScroll,
      contentSize.height,
      viewportHeight,
      showParentGroups,
    ]);

    return (
      <View style={styles.container}>
        <ColumnHeader
          column={column}
          taskCount={totalTaskCount}
          onMenuPress={onColumnMenu || (() => {})}
          onAddTask={onAddTask}
        />

        <View
          style={styles.content}
          onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        >
          {showParentGroups ? (
            <GroupedTaskList
              groups={groupedTasks}
              onTaskPress={onTaskPress}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ) : (
            <TaskList
              ref={taskListRef}
              tasks={tasks}
              parents={parents}
              onTaskPress={onTaskPress}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onContentSizeChange={(width, height) =>
                setContentSize({ width, height })
              }
              onScroll={(event) => {
                if (handleVerticalScroll) {
                  handleVerticalScroll(
                    column.id,
                    event.nativeEvent.contentOffset.y,
                  );
                }
              }}
              scrollEventThrottle={16}
              onEndReached={hasMore ? onLoadMore : undefined}
              onEndReachedThreshold={0.5}
              isLoadingMore={isLoadingMore}
            />
          )}
        </View>
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.column.id === nextProps.column.id &&
      prevProps.column.name === nextProps.column.name &&
      prevProps.column.color === nextProps.column.color &&
      prevProps.column.wipLimit === nextProps.column.wipLimit &&
      prevProps.tasks?.length === nextProps.tasks?.length &&
      prevProps.showParentGroups === nextProps.showParentGroups &&
      prevProps.parents?.length === nextProps.parents?.length
    );
  },
);

ColumnCard.displayName = "ColumnCard";

const styles = StyleSheet.create({
  container: {
    width: 320,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.border.primary,
    overflow: "hidden",
    marginRight: theme.spacing.md,
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 200,
  },
});

export default ColumnCard;
