'use client';

import { use } from 'react';
import Link from 'next/link';
import { useNote } from '@/hooks/use-notes';
import { NoteEditor } from '@/components/notes/note-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NoteDetailPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = use(params);
  const { data: note, isLoading } = useNote(noteId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!note) {
    return <div className="text-muted-foreground">Note not found</div>;
  }

  return (
    <div className="space-y-4">
      <Link href="/notes">
        <Button variant="ghost" size="sm">
          <ArrowLeft size={14} /> Back to Notes
        </Button>
      </Link>
      <NoteEditor note={note} />
    </div>
  );
}
