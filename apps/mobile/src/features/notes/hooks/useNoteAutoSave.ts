import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { uiConstants } from '@shared/theme/uiConstants';
import { getNoteService } from '@core/di/hooks';
import { Note, NoteType } from '@features/notes/domain/entities/Note';
import { SaveStatus } from '@shared/components/AutoSaveIndicator';
import { ProjectId, BoardId, TaskId } from '@core/types';

interface NoteData {
  title: string;
  content: string;
  tags: string[];
  projectIds: ProjectId[];
  boardIds: BoardId[];
  taskIds: TaskId[];
  noteType?: NoteType;
}

interface UseNoteAutoSaveOptions {
  note: Note | null;
  noteData: NoteData;
  onNoteSaved?: (note: Note) => void;
}

export const useNoteAutoSave = ({ note, noteData, onNoteSaved }: UseNoteAutoSaveOptions) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isInitialMount = useRef(true);

  const debouncedTitle = useDebounce(noteData.title, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);
  const debouncedContent = useDebounce(noteData.content, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);
  const debouncedTags = useDebounce(noteData.tags, uiConstants.AUTO_SAVE_DEBOUNCE_TIME);

  const saveNote = useCallback(async () => {
    if (!noteData.title.trim()) return;

    setSaveStatus('saving');
    try {
      const noteService = getNoteService();

      if (note) {
        await noteService.updateNote(note.id, {
          title: noteData.title.trim(),
          content: noteData.content,
          tags: noteData.tags,
          projectIds: noteData.projectIds,
          boardIds: noteData.boardIds,
          taskIds: noteData.taskIds,
        });
      } else {
        const newNote = await noteService.createNote(noteData.title.trim(), noteData.content, {
          noteType: noteData.noteType || 'general',
          projectIds: noteData.projectIds,
          boardIds: noteData.boardIds,
          taskIds: noteData.taskIds,
          tags: noteData.tags,
        });
        onNoteSaved?.(newNote);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [note, noteData, onNoteSaved]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!debouncedTitle.trim()) {
      return;
    }

    saveNote();
  }, [
    debouncedTitle,
    debouncedContent,
    debouncedTags,
    noteData.projectIds,
    noteData.boardIds,
    noteData.taskIds,
  ]);

  return {
    saveStatus,
    saveNote,
  };
};
