import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { TaskDto, TaskPriority } from 'shared-types';
import AppIcon from '@shared/components/icons/AppIcon';
import theme from '@shared/theme';
import { TaskPriorityPicker } from '@features/tasks/components/TaskPriorityPicker';
import { TaskIssueTypePicker } from '@features/tasks/components/TaskIssueTypePicker';
import { useQuickTaskCreate } from '../hooks/useQuickTaskCreate';

interface QuickTaskCreateFormProps {
  onTaskCreated: (task: TaskDto) => void;
  onCancel: () => void;
}

export default function QuickTaskCreateForm({
  onTaskCreated,
  onCancel,
}: QuickTaskCreateFormProps) {
  const {
    title,
    description,
    priority,
    taskType,
    expanded,
    creating,
    error,
    setTitle,
    setDescription,
    setPriority,
    setTaskType,
    toggleExpanded,
    submitQuickCreate,
  } = useQuickTaskCreate();

  const handleSubmit = async () => {
    const task = await submitQuickCreate();
    if (task) {
      onTaskCreated(task);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Task</Text>
        <TouchableOpacity onPress={onCancel} hitSlop={8}>
          <AppIcon name="x" size={20} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Task title..."
          placeholderTextColor={theme.text.secondary}
          value={title}
          onChangeText={setTitle}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <TouchableOpacity
        style={styles.expandToggle}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <AppIcon
          name={expanded ? 'arrow-up' : 'arrow-down'}
          size={16}
          color={theme.text.secondary}
        />
        <Text style={styles.expandToggleText}>
          {expanded ? 'Less options' : 'More options'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedFields}>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description (optional)"
            placeholderTextColor={theme.text.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.fieldLabel}>Priority</Text>
          <TaskPriorityPicker
            selectedPriority={priority ?? TaskPriority.LOW}
            onSelect={setPriority}
          />

          <Text style={styles.fieldLabel}>Type</Text>
          <TaskIssueTypePicker
            selectedIssueType={taskType}
            onSelect={setTaskType}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, creating && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={creating || !title.trim()}
        activeOpacity={0.7}
      >
        {creating ? (
          <ActivityIndicator size="small" color={theme.background.primary} />
        ) : (
          <>
            <AppIcon name="add" size={18} color={theme.background.primary} />
            <Text style={styles.submitButtonText}>Create & Schedule</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.textStyles.h4,
    color: theme.text.primary,
  },
  titleContainer: {
    backgroundColor: theme.input.background,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.input.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  titleInput: {
    color: theme.text.primary,
    fontSize: theme.typography.fontSizes.base,
  },
  errorText: {
    color: theme.status.error,
    fontSize: theme.typography.fontSizes.xs,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  expandToggleText: {
    ...theme.typography.textStyles.caption,
    color: theme.text.secondary,
  },
  expandedFields: {
    gap: theme.spacing.sm,
  },
  descriptionInput: {
    backgroundColor: theme.input.background,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.input.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.text.primary,
    fontSize: theme.typography.fontSizes.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    ...theme.typography.textStyles.caption,
    color: theme.text.secondary,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.accent.primary,
    borderRadius: theme.radius.input,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.background.primary,
    fontSize: theme.typography.fontSizes.base,
    fontWeight: '700',
  },
});
