import React, { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import theme from "@/shared/theme";
import { Column } from "@/features/columns/domain/entities/Column";
import { Task } from "@/features/tasks/domain/entities/Task";
import { DragOverlay, DroppableColumn, useBoardDrag } from "@/features/boards/components/drag-drop";
import { useAutoScroll } from "@/features/boards/hooks/useAutoScroll";

interface BoardColumnsProps {
  columns: Column[];
  bottomPadding: number;
  onTaskPress: (task: Task) => void;
  onDragStart?: (task: Task) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
  onAddTask: (columnId: string) => void;
  draggedTask?: Task | null;
}

export default function BoardColumns({
  columns,
  bottomPadding,
  onTaskPress,
  onDragStart,
  onDragEnd,
  onAddTask,
  draggedTask,
}: BoardColumnsProps) {
  const dragContext = useBoardDrag();
  const listRef = useRef<FlatList<Column>>(null);
  const {
    handleHorizontalScroll,
    handleHorizontalContentSize,
    handleHorizontalLayout,
    registerVerticalScroll,
    handleVerticalScroll,
    unregisterVerticalScroll,
  } = useAutoScroll({
    dragPosition: dragContext.dragPosition,
    isDragging: dragContext.isDragging,
    activeColumnId: dragContext.activeColumnId,
    horizontalScrollRef: listRef,
  });

  return (
    <>
      <FlatList
        ref={listRef}
        style={styles.list}
        horizontal
        data={columns}
        keyExtractor={(column) => column.id}
        renderItem={({ item: column }) => (
          <DroppableColumn
            column={column}
            onTaskPress={onTaskPress}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onAddTask={() => onAddTask(column.id)}
            registerVerticalScroll={registerVerticalScroll}
            handleVerticalScroll={handleVerticalScroll}
            unregisterVerticalScroll={unregisterVerticalScroll}
          />
        )}
        showsHorizontalScrollIndicator={true}
        indicatorStyle="white"
        contentContainerStyle={[
          styles.columnsContainer,
          { paddingBottom: bottomPadding },
        ]}
        snapToInterval={296}
        snapToAlignment="start"
        decelerationRate="fast"
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
      />
      <DragOverlay task={draggedTask ?? null} />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  columnsContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    alignItems: "stretch",
  },
});
