import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Screen } from '@shared/components/Screen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import theme from '@shared/theme/colors';
import { spacing } from '@shared/theme/spacing';
import { noteApi } from '../api/noteApi';
import { NoteDetailDto } from 'shared-types';
import AutoSaveIndicator from '@shared/components/AutoSaveIndicator';
import EntityPicker from '@shared/components/EntityPicker';
import { useEntityNames, useNoteAutoSave } from '@features/notes/hooks';
import {
  NoteTypeSelector,
  NoteTitleInput,
  NoteEntitiesSection,
  NoteTagsSection,
  NoteFormattingToolbar,
  NoteContentEditor,
} from '@features/notes/components';
export default function NoteEditorScreen() {
  const router = useRouter();
  const { noteId: noteIdParam, projectIds, boardIds, taskIds } = useLocalSearchParams<{
    noteId?: string | string[];
    projectIds?: string | string[];
    boardIds?: string | string[];
    taskIds?: string | string[];
  }>();
  const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;

  const normalizeIds = (value?: string | string[]): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  };

  const initialProjectIds = normalizeIds(projectIds);
  const initialBoardIds = normalizeIds(boardIds);
  const initialTaskIds = normalizeIds(taskIds);

  const [note, setNote] = useState<NoteDetailDto | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<string>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialProjectIds || []);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(initialBoardIds || []);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(initialTaskIds || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(!!noteId);
  const [showEntityPicker, setShowEntityPicker] = useState(false);

  const { entityNames } = useEntityNames({
    projectIds: selectedProjects,
    boardIds: selectedBoards,
    taskIds: selectedTasks,
  });

  const { saveStatus } = useNoteAutoSave({
    note,
    noteData: {
      title,
      content,
      tags,
      projectIds: selectedProjects,
      boardIds: selectedBoards,
      taskIds: selectedTasks,
      noteType,
    },
    onNoteSaved: setNote,
  });

  const loadNote = useCallback(async () => {
    if (!noteId) {
      setLoading(false);
      return;
    }

    try {
      const loadedNote = await noteApi.getNoteById(noteId);
      if (loadedNote) {
        setNote(loadedNote);
        setTitle(loadedNote.title);
        setContent(loadedNote.content);
        setNoteType(loadedNote.noteType);
        setTags(loadedNote.tags || []);
        setSelectedProjects(loadedNote.projectIds || []);
        setSelectedBoards(loadedNote.boardIds || []);
        setSelectedTasks(loadedNote.taskIds || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (noteId) {
                await noteApi.deleteNote(noteId);
              }
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  }, [noteId, router]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);

  const handleRemoveProject = useCallback((projectId: string) => {
    setSelectedProjects(selectedProjects.filter(id => id !== projectId));
  }, [selectedProjects]);

  const handleRemoveBoard = useCallback((boardId: string) => {
    setSelectedBoards(selectedBoards.filter(id => id !== boardId));
  }, [selectedBoards]);

  const handleRemoveTask = useCallback((taskId: string) => {
    setSelectedTasks(selectedTasks.filter(id => id !== taskId));
  }, [selectedTasks]);

  const handleEntitySelectionChange = useCallback(
    (projects: string[], boards: string[], tasks: string[]) => {
      setSelectedProjects(projects);
      setSelectedBoards(boards);
      setSelectedTasks(tasks);
    },
    []
  );

  const insertTemplate = useCallback((template: string) => {
    setContent(prev => prev + template);
  }, []);

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
              selectedType={noteType}
              onTypeChange={setNoteType}
              disabled={!!note}
            />
          )}

          <NoteTitleInput
            value={title}
            onChange={setTitle}
            autoFocus={!noteId}
          />

          <NoteEntitiesSection
            selectedProjects={selectedProjects}
            selectedBoards={selectedBoards}
            selectedTasks={selectedTasks}
            entityNames={entityNames}
            onAddEntity={() => setShowEntityPicker(true)}
            onRemoveProject={handleRemoveProject}
            onRemoveBoard={handleRemoveBoard}
            onRemoveTask={handleRemoveTask}
          />

          <NoteTagsSection
            tags={tags}
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <NoteFormattingToolbar onInsertTemplate={insertTemplate} />

          <NoteContentEditor value={content} onChange={setContent} />

          <View style={styles.bottomPadding} />
        </ScrollView>

        <EntityPicker
          visible={showEntityPicker}
          onClose={() => setShowEntityPicker(false)}
          selectedProjects={selectedProjects}
          selectedBoards={selectedBoards}
          selectedTasks={selectedTasks}
          onSelectionChange={handleEntitySelectionChange}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: theme.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  bottomPadding: {
    height: spacing.xxxl * 2,
  },
});
