'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeOverview } from '@/components/time/time-overview';
import { WeeklyChart } from '@/components/time/weekly-chart';

function getWeekRange(offset: number) {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function TimePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { startDate, endDate } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
          This Week
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
          <ChevronRight size={16} />
        </Button>
        <span className="font-mono text-sm text-muted-foreground ml-2">
          {startDate} — {endDate}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeOverview startDate={startDate} endDate={endDate} />
        </div>
        <div>
          <WeeklyChart startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </div>
  );
}
