'use client';

import type { AgendaItemEnrichedDto } from 'shared-types';
import { Badge } from '@/components/ui/badge';
import { useCompleteAgendaItem } from '@/hooks/use-agenda';
import { cn } from '@/lib/utils';
import { Check, RotateCcw } from 'lucide-react';

interface AgendaItemProps {
  item: AgendaItemEnrichedDto;
}

export function AgendaItem({ item }: AgendaItemProps) {
  const completeItem = useCompleteAgendaItem();
  const isCompleted = item.status === 'COMPLETED';
  const isUnfinished = item.status === 'UNFINISHED';

  const title = item.task?.title ?? item.routineTask?.name ?? 'Untitled';
  const subtitle = item.task
    ? `${item.task.projectName} / ${item.task.boardName}`
    : item.routineTask
      ? item.routineTask.routineName
      : null;

  const timeLabel = item.startAt
    ? new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3 py-2 rounded-md border border-border group hover:border-primary/20 transition-colors',
        isCompleted && 'opacity-50',
        isUnfinished && 'border-amber-500/30 bg-amber-500/5',
      )}
    >
      <button
        onClick={() => {
          if (!isCompleted) {
            completeItem.mutate({ agendaId: item.agendaId, id: item.id });
          }
        }}
        className={cn(
          'mt-0.5 w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors',
          isCompleted
            ? 'bg-primary border-primary'
            : 'border-muted-foreground hover:border-primary',
        )}
      >
        {isCompleted && <Check size={10} className="text-primary-foreground" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', isCompleted && 'line-through')}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {timeLabel && (
          <span className="text-xs text-muted-foreground font-mono">{timeLabel}</span>
        )}
        {item.duration && (
          <span className="text-xs text-muted-foreground">{item.duration}m</span>
        )}
        {isUnfinished && (
          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
            <RotateCcw size={8} className="mr-0.5" /> unfinished
          </Badge>
        )}
      </div>
    </div>
  );
}
