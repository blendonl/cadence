'use client';

import { use } from 'react';
import { useTaskDetail } from '@/hooks/use-tasks';
import { TaskDetail } from '@/components/tasks/task-detail';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = use(params);
  const { data: task, isLoading } = useTaskDetail(taskId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!task) {
    return <div className="text-muted-foreground">Task not found</div>;
  }

  return (
    <div className="space-y-4">
      <Link href={`/boards/${task.boardId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft size={14} /> Back to Board
        </Button>
      </Link>
      <TaskDetail task={task} />
    </div>
  );
}
