'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateNote, useDeleteNote } from '@/hooks/use-notes';
import { useRouter } from 'next/navigation';
import type { NoteDetailDto } from 'shared-types';
import { Trash2, Save } from 'lucide-react';

interface NoteEditorProps {
  note: NoteDetailDto;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const router = useRouter();

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = useCallback(() => {
    updateNote.mutate({ id: note.id, data: { title, content } });
  }, [note.id, title, content, updateNote]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-mono text-lg font-semibold border-none bg-transparent focus-visible:ring-0 px-0"
          placeholder="Note title"
        />
        <Button size="sm" variant="ghost" onClick={handleSave} disabled={updateNote.isPending}>
          <Save size={14} /> Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm('Delete this note?')) {
              deleteNote.mutate(note.id, { onSuccess: () => router.push('/notes') });
            }
          }}
        >
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="min-h-[60vh] font-mono text-sm border-none bg-transparent focus-visible:ring-0 px-0 resize-none"
      />
    </div>
  );
}
