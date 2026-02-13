'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NoteList } from '@/components/notes/note-list';
import { useCreateNote } from '@/hooks/use-notes';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
  const createNote = useCreateNote();
  const router = useRouter();

  const handleCreate = () => {
    createNote.mutate(
      { title: 'Untitled Note', content: '' },
      { onSuccess: (note) => router.push(`/notes/${note.id}`) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-semibold">All Notes</h2>
        <Button size="sm" onClick={handleCreate} disabled={createNote.isPending}>
          <Plus size={14} /> New Note
        </Button>
      </div>
      <NoteList />
    </div>
  );
}
