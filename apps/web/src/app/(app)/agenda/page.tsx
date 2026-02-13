'use client';

import { useState } from 'react';
import { useAgendaView } from '@/hooks/use-agenda';
import { DayView } from '@/components/agenda/day-view';
import { WeekView } from '@/components/agenda/week-view';
import { MonthView } from '@/components/agenda/month-view';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgendaViewMode, AgendaDayViewDto, AgendaWeekViewDto, AgendaMonthViewDto } from 'shared-types';
import { cn } from '@/lib/utils';

const today = () => new Date().toISOString().split('T')[0];

const VIEW_MODES: AgendaViewMode[] = ['day', 'week', 'month'];

export default function AgendaPage() {
  const [mode, setMode] = useState<AgendaViewMode>('day');
  const [anchorDate, setAnchorDate] = useState(today());
  const { data: view, isLoading } = useAgendaView(mode, anchorDate);

  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (!view) return;
    const nav = view.navigation;
    if (direction === 'prev') setAnchorDate(nav.previousAnchorDate);
    else if (direction === 'next') setAnchorDate(nav.nextAnchorDate);
    else setAnchorDate(nav.todayAnchorDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('today')}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('next')}>
            <ChevronRight size={16} />
          </Button>
          {view && (
            <span className="font-mono text-sm font-medium ml-2">{view.label}</span>
          )}
        </div>

        <div className="flex rounded-md border border-border overflow-hidden">
          {VIEW_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-1 text-xs font-mono capitalize transition-colors',
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground',
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : view?.mode === 'day' ? (
        <DayView view={view as AgendaDayViewDto} />
      ) : view?.mode === 'week' ? (
        <WeekView view={view as AgendaWeekViewDto} />
      ) : view?.mode === 'month' ? (
        <MonthView view={view as AgendaMonthViewDto} />
      ) : null}
    </div>
  );
}
