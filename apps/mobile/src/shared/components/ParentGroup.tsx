import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Parent } from "@domain/entities/Parent";
import { TaskDto } from "shared-types";
import theme from "@shared/theme";
import { DraggableTaskCard } from "@features/boards/components/drag-drop";
import ParentBadge from "./ParentBadge";

interface ParentGroupProps {
  parent: Parent | null;
  tasks: TaskDto[];
  onTaskPress: (task: TaskDto) => void;
  onDragStart?: (task: TaskDto) => void;
  onDragEnd?: (taskId: string, targetColumnId: string | null) => void;
}

export default function ParentGroup({
  parent,
  tasks,
  onTaskPress,
  onDragStart,
  onDragEnd,
}: ParentGroupProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {parent ? (
          <ParentBadge name={parent.name} color={parent.color} size="medium" />
        ) : (
          <Text style={styles.ungroupedLabel}>No Parent</Text>
        )}
        <Text style={styles.count}>{tasks.length}</Text>
      </View>
      <View style={styles.tasks}>
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            parent={parent || undefined}
            onPress={() => onTaskPress(task)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  ungroupedLabel: {
    ...theme.typography.textStyles.body,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.text.secondary,
    fontStyle: "italic",
  },
  count: {
    ...theme.typography.textStyles.bodySmall,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.text.tertiary,
    backgroundColor: theme.background.elevated,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  tasks: {
    gap: theme.spacing.sm,
  },
});
