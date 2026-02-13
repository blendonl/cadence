'use client';

import { useTimeLogSummary } from '@/hooks/use-time';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyChartProps {
  startDate: string;
  endDate: string;
}

export function WeeklyChart({ startDate, endDate }: WeeklyChartProps) {
  const { data: summary, isLoading } = useTimeLogSummary(startDate, endDate);

  if (isLoading) return <Skeleton className="h-48" />;
  if (!summary || summary.length === 0) return null;

  const maxMinutes = Math.max(...summary.map((s) => s.totalMinutes), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>By Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {summary.map((s) => (
            <div key={s.projectId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{s.projectName}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.floor(s.totalMinutes / 60)}h {s.totalMinutes % 60}m
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(s.totalMinutes / maxMinutes) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
