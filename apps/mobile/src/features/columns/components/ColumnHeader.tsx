import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AppIcon from "@shared/components/icons/AppIcon";
import theme from "@shared/theme";
import { ColumnDto } from "shared-types";

interface ColumnHeaderProps {
  column: ColumnDto;
  taskCount: number;
  onMenuPress: () => void;
  onAddTask: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = React.memo(
  ({ column, taskCount, onMenuPress, onAddTask }) => {
    const isAtCapacity = !!(column.wipLimit && taskCount >= column.wipLimit);
    const isNearCapacity = !!(
      column.wipLimit && taskCount >= column.wipLimit * 0.8
    );

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.leftSection}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <View style={styles.colorIndicator} />
          <Text style={styles.title} numberOfLines={1}>
            {column.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.rightSection}>
          {column.wipLimit && (
            <View
              style={[
                styles.wipLimitBadge,
                isAtCapacity ? styles.wipLimitBadgeAtCapacity : null,
                isNearCapacity && !isAtCapacity
                  ? styles.wipLimitBadgeNearCapacity
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.wipLimitText,
                  isAtCapacity || isNearCapacity
                    ? styles.wipLimitTextWarning
                    : null,
                ]}
              >
                {taskCount}/{column.wipLimit}
              </Text>
            </View>
          )}

          {!column.wipLimit && taskCount > 0 && (
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCountText}>{taskCount}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddTask}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon name="add" size={18} color={theme.accent.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

ColumnHeader.displayName = "ColumnHeader";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
    backgroundColor: theme.background.elevated,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.accent.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text.primary,
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  wipLimitBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.background.elevatedHigh,
  },
  wipLimitBadgeNearCapacity: {
    backgroundColor: theme.accent.warning + "20",
  },
  wipLimitBadgeAtCapacity: {
    backgroundColor: theme.accent.error + "20",
  },
  wipLimitText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.text.secondary,
  },
  wipLimitTextWarning: {
    color: theme.accent.error,
  },
  taskCountBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.accent.primary + "20",
  },
  taskCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.accent.primary,
  },
  addButton: {
    padding: theme.spacing.xs,
  },
});

export default ColumnHeader;
