import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NoteEditor from './NoteEditor';
import { useNoteEditorState } from './useNoteEditorState';

export default function NoteEditorRoute() {
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId?: string | string[] }>();
  const normalizedNoteId = Array.isArray(noteId) ? noteId[0] : noteId;

  const state = useNoteEditorState({
    noteId: normalizedNoteId,
    onDeleted: () => router.back(),
  });

  return <NoteEditor noteId={normalizedNoteId} {...state} />;
}
