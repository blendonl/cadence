import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AppIcon from "@shared/components/icons/AppIcon";
import theme from "@shared/theme/colors";
import { spacing } from "@shared/theme/spacing";
import { getIssueTypeIcon, getAllIssueTypes } from "@utils/issueTypeUtils";
import { TaskType } from "shared-types";

interface TaskIssueTypePickerProps {
  selectedIssueType: TaskType;
  onSelect: (issueType: TaskType) => void;
}

export const TaskIssueTypePicker: React.FC<TaskIssueTypePickerProps> = ({
  selectedIssueType,
  onSelect,
}) => {
  const issueTypes = getAllIssueTypes();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionRow}
      >
        {issueTypes.map((issueType) => {
          const isActive = selectedIssueType === issueType;
          return (
            <TouchableOpacity
              key={issueType}
              style={[
                styles.optionButton,
                isActive && styles.optionButtonActive,
              ]}
              onPress={() => onSelect(issueType)}
              activeOpacity={0.85}
            >
              <AppIcon
                name={getIssueTypeIcon(issueType)}
                size={16}
                color={isActive ? theme.accent.primary : theme.text.secondary}
              />
              <Text
                style={[
                  styles.optionLabel,
                  isActive && styles.optionLabelActive,
                ]}
              >
                {issueType}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.glass.tint.neutral,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  optionButtonActive: {
    borderColor: theme.accent.primary,
    backgroundColor: theme.accent.primary + "20",
  },
  optionLabel: {
    color: theme.text.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  optionLabelActive: {
    color: theme.accent.primary,
  },
});
