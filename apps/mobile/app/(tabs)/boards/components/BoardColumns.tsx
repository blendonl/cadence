import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import ColumnCard from "@/features/boards/components/ColumnCard";
import AddColumnCard from "@/features/boards/components/AddColumnCard";
import { Column } from "@/features/boards/domain/entities/Column";
import { Task } from "@/features/boards/domain/entities/Task";
import theme from "@/shared/theme";

interface BoardColumnsProps {
  columns: Column[];
  bottomPadding: number;
  onTaskPress: (task: Task) => void;
  onTaskLongPress: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onColumnMenu: (column: Column) => void;
  onCreateColumn: () => void;
}

export default function BoardColumns({
  columns,
  bottomPadding,
  onTaskPress,
  onTaskLongPress,
  onAddTask,
  onColumnMenu,
  onCreateColumn,
}: BoardColumnsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={true}
      indicatorStyle="white"
      contentContainerStyle={[
        styles.columnsContainer,
        { paddingBottom: bottomPadding },
      ]}
      snapToInterval={296}
      snapToAlignment="start"
      decelerationRate="fast"
    >
      {columns.map((column) => (
        <ColumnCard
          key={column.id}
          column={column}
          parents={[]}
          onTaskPress={onTaskPress}
          onTaskLongPress={onTaskLongPress}
          onAddTask={() => onAddTask(column.id)}
          onColumnMenu={onColumnMenu}
        />
      ))}
      <AddColumnCard onPress={onCreateColumn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  columnsContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
});
