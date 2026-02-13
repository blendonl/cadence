'use client';

import { useRoutines, useDeleteRoutine } from '@/hooks/use-routines';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Moon, Footprints, Repeat } from 'lucide-react';

const TYPE_ICONS = {
  SLEEP: Moon,
  STEP: Footprints,
  OTHER: Repeat,
} as const;

export function RoutineList() {
  const { data: routines, isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (!routines || routines.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No routines yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {routines.map((routine) => {
        const Icon = TYPE_ICONS[routine.type] || Repeat;
        return (
          <Card key={routine.id}>
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-primary shrink-0" />
                <CardTitle className="flex-1 truncate">{routine.name}</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{routine.type}</Badge>
                <Badge variant={routine.isActive ? 'default' : 'outline'} className="text-[10px]">
                  {routine.isActive ? 'Active' : 'Disabled'}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => {
                    if (confirm('Delete?')) deleteRoutine.mutate(routine.id);
                  }}
                >
                  <Trash2 size={12} className="text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Target: {routine.target}</span>
                <span>Every {routine.repeatIntervalMinutes}m</span>
                {routine.tasks.length > 0 && (
                  <span>{routine.tasks.length} tasks</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
