'use client';

import type { AgendaMonthViewDto } from 'shared-types';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  view: AgendaMonthViewDto;
}

export function MonthView({ view }: MonthViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-px">
        {view.weekdayLabels.map((label) => (
          <div key={label} className="text-center text-xs text-muted-foreground font-mono py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {view.days.map((day) => (
          <div
            key={day.dateKey}
            className={cn(
              'bg-card p-1.5 min-h-[80px]',
              !day.isCurrentMonth && 'opacity-40',
              day.isToday && 'ring-1 ring-primary/50',
            )}
          >
            <span
              className={cn(
                'text-xs font-mono',
                day.isToday
                  ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 inline-flex items-center justify-center'
                  : 'text-muted-foreground',
              )}
            >
              {day.label}
            </span>
            <div className="mt-1 space-y-0.5">
              {day.items.slice(0, 3).map((item) => {
                const title = item.task?.title ?? item.routineTask?.name ?? '';
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'text-[10px] truncate px-1 rounded',
                      item.status === 'COMPLETED'
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground bg-accent',
                    )}
                  >
                    {title}
                  </div>
                );
              })}
              {day.overflowCount > 0 && (
                <div className="text-[10px] text-muted-foreground px-1">
                  +{day.overflowCount} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
