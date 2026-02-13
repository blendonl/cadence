'use client';

import type { AgendaDayViewDto } from 'shared-types';
import { AgendaItem } from './agenda-item';

interface DayViewProps {
  view: AgendaDayViewDto;
}

export function DayView({ view }: DayViewProps) {
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

      {view.allDayItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            All Day
          </h3>
          <div className="space-y-1">
            {view.allDayItems.map((item) => (
              <AgendaItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {view.hours
          .filter((hour) => hour.items.length > 0)
          .map((hour) => (
            <div key={hour.hour} className="flex gap-3">
              <div className="w-12 shrink-0 text-right">
                <span className="text-xs text-muted-foreground font-mono">{hour.label}</span>
              </div>
              <div className="flex-1 space-y-1">
                {hour.items.map((item) => (
                  <AgendaItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
      </div>

      {view.isEmpty && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nothing scheduled for today
        </div>
      )}
    </div>
  );
}
