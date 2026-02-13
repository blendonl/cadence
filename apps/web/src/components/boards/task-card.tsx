'use client';

import Link from 'next/link';
import type { TaskDto } from 'shared-types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

interface TaskCardProps {
  task: TaskDto;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-md border border-border bg-card p-3 space-y-2 cursor-grab active:cursor-grabbing hover:border-primary/20 transition-colors',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <Link href={`/tasks/${task.id}`} className="block" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium leading-tight">{task.title}</p>
      </Link>
      <div className="flex items-center gap-1.5">
        {task.priority && (
          <Badge
            variant="outline"
            className={cn('text-[10px] py-0', PRIORITY_COLORS[task.priority])}
          >
            {task.priority}
          </Badge>
        )}
        {task.dueDate && (
          <span className="text-[10px] text-muted-foreground">
            {task.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
