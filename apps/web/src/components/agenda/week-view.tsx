'use client';

import type { AgendaWeekViewDto } from 'shared-types';
import { AgendaItem } from './agenda-item';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  view: AgendaWeekViewDto;
}

export function WeekView({ view }: WeekViewProps) {
  return (
    <div className="space-y-6">
      {view.unfinishedItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-amber-400">
            Unfinished
          </h3>
          <div className="space-y-1">
            {view.unfinishedItems.map((item) => (
              <AgendaItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {view.days.map((day) => (
          <div
            key={day.dateKey}
            className={cn(
              'bg-card p-2 min-h-[120px]',
              day.isToday && 'ring-1 ring-primary/50',
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  'text-xs font-mono',
                  day.isToday ? 'text-primary font-bold' : 'text-muted-foreground',
                )}
              >
                {day.shortLabel}
              </span>
            </div>
            <div className="space-y-1">
              {day.allDayItems.map((item) => (
                <AgendaItem key={item.id} item={item} />
              ))}
              {day.timedItems.map(({ item }) => (
                <AgendaItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
