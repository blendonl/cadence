'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject, useDeleteProject } from '@/hooks/use-projects';
import { useBoardsByProject } from '@/hooks/use-boards';
import { useNotesByProject } from '@/hooks/use-notes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Kanban, FileText, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);
  const { data: boards } = useBoardsByProject(projectId);
  const { data: notes } = useNotesByProject(projectId);
  const deleteProject = useDeleteProject();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-muted-foreground">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <h2 className="font-mono text-lg font-semibold">{project.name}</h2>
        <Badge variant="secondary">{project.status}</Badge>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('Delete this project?')) {
                deleteProject.mutate(projectId, { onSuccess: () => router.push('/projects') });
              }
            }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground">{project.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold">{project.stats.boardCount}</div>
            <div className="text-xs text-muted-foreground">Boards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold">{project.stats.noteCount}</div>
            <div className="text-xs text-muted-foreground">Notes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-mono font-bold">
              {Math.round(project.stats.timeThisWeek / 60)}h
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-sm font-medium flex items-center gap-2">
          <Kanban size={14} /> Boards
        </h3>
        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>{board.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No boards yet</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-sm font-medium flex items-center gap-2">
          <FileText size={14} /> Notes
        </h3>
        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
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
        ) : (
          <p className="text-xs text-muted-foreground">No notes yet</p>
        )}
      </div>
    </div>
  );
}
