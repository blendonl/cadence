'use client';

import type { BoardColumnDto } from 'shared-types';
import { TaskCard } from './task-card';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: BoardColumnDto;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column', column } });

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: column.color || '#d97706' }}
          />
          <span className="font-mono text-xs font-medium uppercase tracking-wider">
            {column.name}
          </span>
          <span className="text-xs text-muted-foreground">{column.taskCount}</span>
        </div>
        {column.wipLimit && (
          <span className="text-[10px] text-muted-foreground">
            / {column.wipLimit}
          </span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 p-1 rounded-md min-h-[120px] transition-colors',
          isOver && 'bg-primary/5 ring-1 ring-primary/20',
        )}
      >
        <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
