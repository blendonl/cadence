import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@shared/components/Screen";
import theme from "@shared/theme/colors";
import { spacing } from "@shared/theme/spacing";
import { useTaskForm } from "@/features/tasks/hooks/useTaskForm";
import { useTaskCreation } from "@/features/tasks/hooks/useTaskCreation";
import { TaskFormHeader } from "@/features/tasks/components/TaskFormHeader";
import { TaskMetaBar } from "@/features/tasks/components/TaskMetaBar";
import { TaskPriorityPicker } from "@/features/tasks/components/TaskPriorityPicker";
import { TaskIssueTypePicker } from "@/features/tasks/components/TaskIssueTypePicker";
import { TaskTitleInput } from "@/features/tasks/components/TaskTitleInput";
import { TaskDescriptionEditor } from "@/features/tasks/components/TaskDescriptionEditor";
import { PRIORITY_OPTIONS } from "@/features/tasks/constants/priorities";
import { MetaPickerType } from "@/features/tasks/types";
import { TaskType } from "shared-types";

export default function NewTaskRoute() {
  const { columnId } = useLocalSearchParams<{ columnId: string }>();
  const router = useRouter();
  const { formState, actions } = useTaskForm();
  const { creating, createTask } = useTaskCreation({ columnId: columnId! });

  const [activeMetaPicker, setActiveMetaPicker] =
    useState<MetaPickerType>(null);

  const handleSubmit = async () => {
    const success = await createTask(actions.getData());
    if (success) {
      actions.reset();
    }
  };

  const handlePrioritySelect = (priority: any) => {
    actions.updateField("priority", priority);
    setActiveMetaPicker(null);
  };

  const handleIssueTypeSelect = (issueType: TaskType) => {
    actions.updateField("issueType", issueType);
    setActiveMetaPicker(null);
  };

  const togglePriorityPicker = () => {
    setActiveMetaPicker(activeMetaPicker === "priority" ? null : "priority");
  };

  const toggleIssueTypePicker = () => {
    setActiveMetaPicker(activeMetaPicker === "issueType" ? null : "issueType");
  };

  const selectedPriority =
    PRIORITY_OPTIONS.find((opt) => opt.value === formState.priority) ||
    PRIORITY_OPTIONS[3];

  return (
    <Screen style={styles.container} scrollable={false}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        <TaskFormHeader
          onCancel={() => router.back()}
          onSubmit={handleSubmit}
          submitLabel={creating ? "Creating..." : "Create"}
          submitDisabled={!actions.isValid() || creating}
          title="New Task"
        />

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <TaskMetaBar
            priorityLabel={selectedPriority.label}
            priorityColor={selectedPriority.color}
            issueType={formState.issueType}
            selectedParent={null}
            targetColumn={{ id: columnId!, name: "" }}
            activeMetaPicker={activeMetaPicker}
            onPriorityPress={togglePriorityPicker}
            onIssueTypePress={toggleIssueTypePicker}
            onParentPress={() => {}}
          />

          {activeMetaPicker === "priority" && (
            <TaskPriorityPicker
              selectedPriority={formState.priority}
              onSelect={handlePrioritySelect}
            />
          )}

          {activeMetaPicker === "issueType" && (
            <TaskIssueTypePicker
              selectedIssueType={formState.issueType}
              onSelect={handleIssueTypeSelect}
            />
          )}

          <TaskTitleInput
            value={formState.title}
            onChangeText={(text) => actions.updateField("title", text)}
          />

          <TaskDescriptionEditor
            value={formState.description}
            onChangeText={(text) => actions.updateField("description", text)}
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
