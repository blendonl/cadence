'use client';

import type { TaskDetailDto } from 'shared-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { useRouter } from 'next/navigation';
import { Trash2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

interface TaskDetailProps {
  task: TaskDetailDto;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleComplete = () => {
    updateTask.mutate({
      taskId: task.id,
      updates: { status: 'DONE' as any, completedAt: new Date().toISOString() },
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{task.projectName}</span>
          <span>/</span>
          <span>{task.boardName}</span>
          <span>/</span>
          <span>{task.columnName}</span>
        </div>
        <h2 className="font-mono text-xl font-semibold">{task.title}</h2>
        <div className="flex items-center gap-2">
          {task.priority && (
            <Badge variant="outline" className={cn('text-xs', PRIORITY_COLORS[task.priority])}>
              {task.priority}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {STATUS_LABELS[task.status] || task.status}
          </Badge>
          {task.dueDate && (
            <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
          )}
        </div>
      </div>

      {task.description && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {task.description}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {task.estimatedMinutes && (
          <div>
            <span className="text-muted-foreground">Estimated: </span>
            <span>{task.estimatedMinutes}m</span>
          </div>
        )}
        {task.actualMinutes && (
          <div>
            <span className="text-muted-foreground">Actual: </span>
            <span>{task.actualMinutes}m</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t border-border">
        {task.status !== 'DONE' && (
          <Button size="sm" onClick={handleComplete}>
            <CheckCircle size={14} /> Complete
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            if (confirm('Delete this task?')) {
              deleteTask.mutate(task.id, { onSuccess: () => router.back() });
            }
          }}
        >
          <Trash2 size={14} className="text-destructive" /> Delete
        </Button>
      </div>
    </div>
  );
}
