'use client';

import type { BoardDetailDto } from 'shared-types';
import { KanbanColumn } from './kanban-column';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useUpdateTask } from '@/hooks/use-tasks';

interface KanbanBoardProps {
  board: BoardDetailDto;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const updateTask = useUpdateTask();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overData = over.data.current;

    let targetColumnId: string | undefined;

    if (overData?.type === 'column') {
      targetColumnId = over.id as string;
    } else if (overData?.type === 'task') {
      targetColumnId = overData.task?.columnId;
    }

    if (!targetColumnId) return;

    const currentTask = board.columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === taskId);

    if (currentTask && currentTask.columnId !== targetColumnId) {
      updateTask.mutate({ taskId, updates: { columnId: targetColumnId } });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns
          .sort((a, b) => a.position - b.position)
          .map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
      </div>
    </DndContext>
  );
}
