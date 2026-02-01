import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@shared/hooks/useDebounce';
import { uiConstants } from '@shared/theme/uiConstants';
import { noteApi } from '../api/noteApi';
import { NoteDetailDto } from 'shared-types';
import { SaveStatus } from '@shared/components/AutoSaveIndicator';

interface NoteData {
  title: string;
  content: string;
  tags: string[];
  projectIds: string[];
  boardIds: string[];
  taskIds: string[];
  noteType?: string;
}

interface UseNoteAutoSaveOptions {
  note: NoteDetailDto | null;
  noteData: NoteData;
  onNoteSaved?: (note: NoteDetailDto) => void;
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
      if (note) {
        await noteApi.updateNote(note.id, {
          title: noteData.title.trim(),
          content: noteData.content,
          tags: noteData.tags,
          projectIds: noteData.projectIds,
          boardIds: noteData.boardIds,
          taskIds: noteData.taskIds,
        });
      } else {
        const newNoteDto = await noteApi.createNote({
          title: noteData.title.trim(),
          content: noteData.content,
          noteType: noteData.noteType || 'general',
          projectIds: noteData.projectIds,
          boardIds: noteData.boardIds,
          taskIds: noteData.taskIds,
          tags: noteData.tags,
        });
        const fullNote = await noteApi.getNoteById(newNoteDto.id);
        if (fullNote) {
          onNoteSaved?.(fullNote);
        }
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
