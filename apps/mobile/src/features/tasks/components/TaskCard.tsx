import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Parent } from "@domain/entities/Parent";
import { TaskDto, TaskPriority, TaskStatus, TaskType } from "shared-types";
import ParentBadge from "@shared/components/ParentBadge";
import theme from "@shared/theme";
import AppIcon from "@shared/components/icons/AppIcon";

interface TaskCardProps {
  task: TaskDto;
  parent?: Parent;
  onPress: () => void;
  onLongPress?: () => void;
  isLoading?: boolean;
  showDragHandle?: boolean;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: "#DC2626",
  [TaskPriority.HIGH]: "#EA580C",
  [TaskPriority.MEDIUM]: "#CA8A04",
  [TaskPriority.LOW]: "#64748B",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: theme.text.muted,
  [TaskStatus.IN_PROGRESS]: theme.accent.primary,
  [TaskStatus.DONE]: theme.accent.success,
  [TaskStatus.BLOCKED]: theme.accent.error,
  [TaskStatus.CANCELLED]: theme.text.tertiary,
};

const DUE_SOON_DAYS = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const isInactiveStatus = (status: TaskStatus) =>
  status === TaskStatus.DONE || status === TaskStatus.CANCELLED;

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const getDueLabel = (dueDate: string | null, status: TaskStatus) => {
  if (!dueDate || isInactiveStatus(status)) return null;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const due = parseDate(dueDate);
  const diffDays = Math.floor((due.getTime() - todayStart.getTime()) / MS_PER_DAY);

  if (diffDays < 0) {
    const daysLate = Math.abs(diffDays);
    return daysLate === 1 ? "Overdue by 1 day" : `Overdue by ${daysLate} days`;
  }

  if (diffDays === 0) return "Due today";
  if (diffDays <= DUE_SOON_DAYS) return `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  return `Due ${dueDate}`;
};

const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({
    task,
    parent,
    onPress,
    onLongPress,
    isLoading = false,
    showDragHandle = false,
  }) => {
    const priorityValue = (task.priority ?? TaskPriority.LOW) as TaskPriority;
    const priorityColor = PRIORITY_COLORS[priorityValue] || PRIORITY_COLORS[TaskPriority.LOW];
    const dueLabel = getDueLabel(task.dueDate, task.status as TaskStatus);
    const isOverdue = !!dueLabel && dueLabel.startsWith("Overdue");
    const isMeeting = task.taskType === TaskType.MEETING;
    const isSubtask = task.taskType === TaskType.SUBTASK;
    const statusColor = STATUS_COLORS[task.status as TaskStatus] || theme.text.muted;

    return (
      <TouchableOpacity
        style={[styles.card, isLoading && styles.cardLoading]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        disabled={isLoading}
      >
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.accent.primary} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {showDragHandle && (
                <View style={styles.dragHandle}>
                  <AppIcon
                    name="reorder-two"
                    size={18}
                    color={theme.text.secondary}
                  />
                </View>
              )}
              <Text style={styles.title} numberOfLines={2}>
                {task.title}
              </Text>
            </View>

            {task.slug ? (
              <View style={styles.slugPill}>
                <Text style={styles.slugText}>{task.slug}</Text>
              </View>
            ) : (
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            )}
          </View>

          {parent && (
            <View style={styles.parentContainer}>
              <ParentBadge
                name={parent.name}
                color={parent.color}
                size="small"
              />
            </View>
          )}

          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.badges}>
              <View style={styles.priorityChip}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: priorityColor },
                  ]}
                />
                <Text style={styles.priorityText}>
                  {priorityValue.charAt(0) + priorityValue.slice(1).toLowerCase()}
                </Text>
              </View>

              {isMeeting && (
                <View style={styles.metaChip}>
                  <AppIcon
                    name="videocam"
                    size={12}
                    color={theme.accent.primary}
                  />
                  <Text style={styles.metaChipText}>Meeting</Text>
                </View>
              )}

              {isSubtask && (
                <View style={styles.metaChip}>
                  <AppIcon
                    name="git-merge"
                    size={12}
                    color={theme.text.secondary}
                  />
                  <Text style={styles.metaChipText}>Subtask</Text>
                </View>
              )}

              {dueLabel && (
                <View style={styles.metaChip}>
                  <AppIcon
                    name="time"
                    size={12}
                    color={isOverdue ? theme.accent.error : theme.accent.warning}
                  />
                  <Text
                    style={[
                      styles.metaChipText,
                      isOverdue && styles.metaChipTextOverdue,
                    ]}
                  >
                    {dueLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

TaskCard.displayName = "TaskCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background.elevated,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    ...theme.shadows.card,
  },
  cardLoading: {
    opacity: 0.6,
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 17, 21, 0.65)",
    zIndex: 10,
    borderRadius: theme.radius.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  dragHandle: {
    marginRight: theme.spacing.xs,
    marginTop: 2,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: theme.text.primary,
    lineHeight: 20,
  },
  slugPill: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  slugText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: theme.text.tertiary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  parentContainer: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badges: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.background.elevatedHigh,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.text.secondary,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.glass.tint.neutral,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.text.secondary,
  },
  metaChipTextOverdue: {
    color: theme.accent.error,
  },
});

export default TaskCard;
