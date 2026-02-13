'use client';

import Link from 'next/link';
import { useNotes } from '@/hooks/use-notes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function NoteList() {
  const { data: notes, isLoading } = useNotes();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No notes yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <Link key={note.id} href={`/notes/${note.id}`}>
          <Card className="hover:border-primary/20 transition-colors cursor-pointer">
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate">{note.title}</CardTitle>
                <Badge variant="secondary" className="text-[10px] shrink-0">
                  {note.type}
                </Badge>
              </div>
            </CardHeader>
            {note.preview && (
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{note.preview}</p>
              </CardContent>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
