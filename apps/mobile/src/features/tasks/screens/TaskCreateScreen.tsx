import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@shared/components/Screen';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { useTaskForm } from '../hooks/useTaskForm';
import { useTaskCreation } from '../hooks/useTaskCreation';
import { TaskFormHeader } from '../components/TaskFormHeader';
import { TaskMetaBar } from '../components/TaskMetaBar';
import { TaskPriorityPicker } from '../components/TaskPriorityPicker';
import { TaskIssueTypePicker } from '../components/TaskIssueTypePicker';
import { TaskParentPicker } from '../components/TaskParentPicker';
import { TaskTitleInput } from '../components/TaskTitleInput';
import { TaskDescriptionEditor } from '../components/TaskDescriptionEditor';
import { PRIORITY_OPTIONS } from '../constants/priorities';
import { MetaPickerType, TaskCreateScreenProps } from '../types';

export default function TaskCreateScreen({ columnId }: TaskCreateScreenProps) {
  const router = useRouter();
  const { formState, actions } = useTaskForm();
  const { creating, createTask } = useTaskCreation({ columnId });

  const [activeMetaPicker, setActiveMetaPicker] = useState<MetaPickerType>(null);

  const handleSubmit = async () => {
    const success = await createTask(actions.getData());
    if (success) {
      actions.reset();
    }
  };

  const handlePrioritySelect = (priority: any) => {
    actions.updateField('priority', priority);
    setActiveMetaPicker(null);
  };

  const handleIssueTypeSelect = (issueType: string) => {
    actions.updateField('issueType', issueType);
    setActiveMetaPicker(null);
  };

  const togglePriorityPicker = () => {
    setActiveMetaPicker(activeMetaPicker === 'priority' ? null : 'priority');
  };

  const toggleIssueTypePicker = () => {
    setActiveMetaPicker(activeMetaPicker === 'issueType' ? null : 'issueType');
  };

  const selectedPriority = PRIORITY_OPTIONS.find((opt) => opt.value === formState.priority) || PRIORITY_OPTIONS[3];

  return (
    <Screen style={styles.container} scrollable={false}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <TaskFormHeader
          onCancel={() => router.back()}
          onSubmit={handleSubmit}
          submitLabel={creating ? 'Creating...' : 'Create'}
          submitDisabled={!actions.isValid() || creating}
          title="New Task"
        />

        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <TaskMetaBar
            priorityLabel={selectedPriority.label}
            priorityColor={selectedPriority.color}
            issueType={formState.issueType}
            selectedParent={null}
            targetColumn={{ id: columnId, name: '' }}
            activeMetaPicker={activeMetaPicker}
            onPriorityPress={togglePriorityPicker}
            onIssueTypePress={toggleIssueTypePicker}
            onParentPress={() => {}}
          />

          {activeMetaPicker === 'priority' && (
            <TaskPriorityPicker
              selectedPriority={formState.priority}
              onSelect={handlePrioritySelect}
            />
          )}

          {activeMetaPicker === 'issueType' && (
            <TaskIssueTypePicker
              selectedIssueType={formState.issueType}
              onSelect={handleIssueTypeSelect}
            />
          )}

          <TaskTitleInput
            value={formState.title}
            onChangeText={(text) => actions.updateField('title', text)}
          />

          <TaskDescriptionEditor
            value={formState.description}
            onChangeText={(text) => actions.updateField('description', text)}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
