'use client';

import { useTimeLogs } from '@/hooks/use-time';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

interface TimeOverviewProps {
  startDate: string;
  endDate: string;
}

export function TimeOverview({ startDate, endDate }: TimeOverviewProps) {
  const { data: logs, isLoading } = useTimeLogs({ startDate, endDate });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No time logs for this period.
      </div>
    );
  }

  const totalMinutes = logs.reduce((sum, log) => sum + (log.duration ?? 0), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 flex items-center gap-3">
          <Clock size={18} className="text-primary" />
          <div>
            <div className="text-2xl font-mono font-bold">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <div className="text-xs text-muted-foreground">Total logged</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardHeader className="py-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">
                    {log.taskTitle || log.description || 'Untitled'}
                  </CardTitle>
                  {log.projectName && (
                    <p className="text-xs text-muted-foreground">{log.projectName}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm">
                    {log.duration ? `${Math.floor(log.duration / 60)}h ${log.duration % 60}m` : '—'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {log.endTime && (
                      <> — {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    )}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
