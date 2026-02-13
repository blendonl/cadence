'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBoard } from '@/hooks/use-boards';
import { KanbanBoard } from '@/components/boards/kanban-board';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = use(params);
  const { data: board, isLoading } = useBoard(boardId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  if (!board) {
    return <div className="text-muted-foreground">Board not found</div>;
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <Link href={`/projects/${board.projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h2 className="font-mono text-lg font-semibold">{board.name}</h2>
        <span className="text-xs text-muted-foreground">{board.projectName}</span>
      </div>
      <div className="flex-1 overflow-x-auto">
        <KanbanBoard board={board} />
      </div>
    </div>
  );
}
