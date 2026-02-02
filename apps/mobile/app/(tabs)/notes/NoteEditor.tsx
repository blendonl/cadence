import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Screen } from '@shared/components/Screen';
import AutoSaveIndicator from '@shared/components/AutoSaveIndicator';
import EntityPicker from '@shared/components/EntityPicker';
import { useEntityNames } from '@features/notes/hooks';
import {
  NoteTypeSelector,
  NoteTitleInput,
  NoteEntitiesSection,
  NoteTagsSection,
  NoteFormattingToolbar,
  NoteContentEditor,
} from '@features/notes/components';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { BoardDto, NoteDetailDto, ProjectDto, TaskDto } from 'shared-types';
import { SaveStatus } from '@shared/components/AutoSaveIndicator';
import type { NoteDetails } from './useNoteEditorState';

interface NoteEditorProps {
  noteId?: string;
  note: NoteDetailDto | null;
  loading: boolean;
  saveStatus: SaveStatus;
  noteDetails: NoteDetails;
  tagInput: string;
  entityNames: ReturnType<typeof useEntityNames>['entityNames'];
  showEntityPicker: boolean;
  onNoteDetailsChange: (updates: Partial<NoteDetails>) => void;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onOpenEntityPicker: () => void;
  onCloseEntityPicker: () => void;
  onEntitySelectionChange: (
    projects: ProjectDto[],
    boards: BoardDto[],
    tasks: TaskDto[],
  ) => void;
  onRemoveProject: (id: string) => void;
  onRemoveBoard: (id: string) => void;
  onRemoveTask: (id: string) => void;
  onInsertTemplate: (template: string) => void;
  onDelete?: () => void;
}

export default function NoteEditor({
  noteId,
  note,
  loading,
  saveStatus,
  noteDetails,
  tagInput,
  entityNames,
  showEntityPicker,
  onNoteDetailsChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onOpenEntityPicker,
  onCloseEntityPicker,
  onEntitySelectionChange,
  onRemoveProject,
  onRemoveBoard,
  onRemoveTask,
  onInsertTemplate,
  onDelete,
}: NoteEditorProps) {
  const { type, title, content, tags, projects, boards, tasks } = noteDetails;

  if (loading) {
    return (
      <Screen>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container} scrollable={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <AutoSaveIndicator status={saveStatus} />

        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {!noteId && (
            <NoteTypeSelector
              selectedType={type}
              onTypeChange={(nextType) => onNoteDetailsChange({ type: nextType })}
              disabled={!!note}
            />
          )}

          <NoteTitleInput
            value={title}
            onChange={(value) => onNoteDetailsChange({ title: value })}
            autoFocus={!noteId}
          />

          <NoteEntitiesSection
            selectedProjects={projects}
            selectedBoards={boards}
            selectedTasks={tasks}
            entityNames={entityNames}
            onAddEntity={onOpenEntityPicker}
            onRemoveProject={onRemoveProject}
            onRemoveBoard={onRemoveBoard}
            onRemoveTask={onRemoveTask}
          />

          <NoteTagsSection
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={onTagInputChange}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />

          <NoteFormattingToolbar onInsertTemplate={onInsertTemplate} />

          <NoteContentEditor
            value={content}
            onChange={(value) => onNoteDetailsChange({ content: value })}
          />
        </ScrollView>

        {note && onDelete && (
          <View style={styles.deleteButtonContainer}>
            <Text style={styles.deleteButtonText} onPress={onDelete}>
              Delete Note
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

      <EntityPicker
        visible={showEntityPicker}
        onClose={onCloseEntityPicker}
        selectedProjects={projects}
        selectedBoards={boards}
        selectedTasks={tasks}
        onSelectionChange={onEntitySelectionChange}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    color: theme.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  deleteButtonContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: theme.accent.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
