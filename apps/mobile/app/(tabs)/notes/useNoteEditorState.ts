import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { getNoteService } from '@core/di/hooks';
import { useEntityNames, useNoteAutoSave } from '@features/notes/hooks';
import { BoardDto, NoteDetailDto, NoteType, ProjectDto, TaskDto } from 'shared-types';

export interface NoteDetails {
  type: NoteType;
  title: string;
  content: string;
  tags: string[];
  projects: ProjectDto[];
  boards: BoardDto[];
  tasks: TaskDto[];
}

interface NoteEditorStateOptions {
  noteId?: string;
  initialType?: NoteType;
  initialProjects?: ProjectDto[];
  initialBoards?: BoardDto[];
  initialTasks?: TaskDto[];
  onDeleted?: () => void;
}

export const useNoteEditorState = ({
  noteId,
  initialType = NoteType.General,
  initialProjects = [],
  initialBoards = [],
  initialTasks = [],
  onDeleted,
}: NoteEditorStateOptions) => {
  const [note, setNote] = useState<NoteDetailDto | null>(null);
  const [noteDetails, setNoteDetails] = useState<NoteDetails>({
    type: initialType,
    title: '',
    content: '',
    tags: [],
    projects: initialProjects,
    boards: initialBoards,
    tasks: initialTasks,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(!!noteId);
  const [showEntityPicker, setShowEntityPicker] = useState(false);

  const { entityNames } = useEntityNames({
    projects: noteDetails.projects,
    boards: noteDetails.boards,
    tasks: noteDetails.tasks,
  });

  const { saveStatus } = useNoteAutoSave({
    note,
    noteData: noteDetails,
    onNoteSaved: setNote,
  });

  const updateNoteDetails = useCallback((updates: Partial<NoteDetails>) => {
    setNoteDetails((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadNote = useCallback(async () => {
    if (!noteId) {
      setLoading(false);
      return;
    }

    try {
      const noteService = getNoteService();
      const loadedNote = await noteService.getNoteById(noteId);
      if (loadedNote) {
        setNote(loadedNote);
        updateNoteDetails({
          type: loadedNote.type ?? NoteType.General,
          title: loadedNote.title,
          content: loadedNote.content,
          tags: loadedNote.tags || [],
          projects: loadedNote.projects || [],
          boards: loadedNote.boards || [],
          tasks: loadedNote.tasks || [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [noteId, updateNoteDetails]);

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
            if (!noteId) {
              return;
            }
            try {
              const noteService = getNoteService();
              await noteService.deleteNote(noteId);
              onDeleted?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ],
    );
  }, [noteId, onDeleted]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !noteDetails.tags.includes(tagInput.trim().toLowerCase())) {
      updateNoteDetails({
        tags: [...noteDetails.tags, tagInput.trim().toLowerCase()],
      });
      setTagInput('');
    }
  }, [noteDetails.tags, tagInput, updateNoteDetails]);

  const handleRemoveTag = useCallback(
    (tag: string) => {
      updateNoteDetails({
        tags: noteDetails.tags.filter((t) => t !== tag),
      });
    },
    [noteDetails.tags, updateNoteDetails],
  );

  const handleRemoveProject = useCallback(
    (projectId: string) => {
      updateNoteDetails({
        projects: noteDetails.projects.filter((project) => project.id !== projectId),
      });
    },
    [noteDetails.projects, updateNoteDetails],
  );

  const handleRemoveBoard = useCallback(
    (boardId: string) => {
      updateNoteDetails({
        boards: noteDetails.boards.filter((board) => board.id !== boardId),
      });
    },
    [noteDetails.boards, updateNoteDetails],
  );

  const handleRemoveTask = useCallback(
    (taskId: string) => {
      updateNoteDetails({
        tasks: noteDetails.tasks.filter((task) => task.id !== taskId),
      });
    },
    [noteDetails.tasks, updateNoteDetails],
  );

  const handleEntitySelectionChange = useCallback(
    (projects: ProjectDto[], boards: BoardDto[], tasks: TaskDto[]) => {
      updateNoteDetails({
        projects,
        boards,
        tasks,
      });
    },
    [updateNoteDetails],
  );

  const insertTemplate = useCallback(
    (template: string) => {
      updateNoteDetails({ content: noteDetails.content + template });
    },
    [noteDetails.content, updateNoteDetails],
  );

  const openEntityPicker = useCallback(() => setShowEntityPicker(true), []);
  const closeEntityPicker = useCallback(() => setShowEntityPicker(false), []);

  return useMemo(
    () => ({
      note,
      loading,
      saveStatus,
      noteDetails,
      tagInput,
      entityNames,
      showEntityPicker,
      onNoteDetailsChange: updateNoteDetails,
      onTagInputChange: setTagInput,
      onAddTag: handleAddTag,
      onRemoveTag: handleRemoveTag,
      onOpenEntityPicker: openEntityPicker,
      onCloseEntityPicker: closeEntityPicker,
      onEntitySelectionChange: handleEntitySelectionChange,
      onRemoveProject: handleRemoveProject,
      onRemoveBoard: handleRemoveBoard,
      onRemoveTask: handleRemoveTask,
      onInsertTemplate: insertTemplate,
      onDelete: note ? handleDelete : undefined,
    }),
    [
      note,
      loading,
      saveStatus,
      noteDetails,
      tagInput,
      entityNames,
      showEntityPicker,
      updateNoteDetails,
      handleAddTag,
      handleRemoveTag,
      openEntityPicker,
      closeEntityPicker,
      handleEntitySelectionChange,
      handleRemoveProject,
      handleRemoveBoard,
      handleRemoveTask,
      insertTemplate,
      handleDelete,
    ],
  );
};
