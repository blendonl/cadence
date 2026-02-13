'use client';

import { useGoals, useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function GoalList() {
  const { data: goals, isLoading } = useGoals({ status: 'active' });
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No goals yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <Card key={goal.id} className="hover:border-primary/20 transition-colors">
          <CardHeader className="pb-1">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary shrink-0" />
              <CardTitle className="flex-1 truncate">{goal.title}</CardTitle>
              <Badge variant="secondary" className="text-[10px]">{goal.status}</Badge>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => updateGoal.mutate({
                  id: goal.id,
                  data: { status: 'completed', completedAt: new Date().toISOString() },
                })}
              >
                <Check size={12} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  if (confirm('Delete?')) deleteGoal.mutate(goal.id);
                }}
              >
                <Trash2 size={12} className="text-destructive" />
              </Button>
            </div>
          </CardHeader>
          {(goal.description || goal.targetDate) && (
            <CardContent>
              {goal.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
              )}
              {goal.targetDate && (
                <p className="text-xs text-muted-foreground mt-1">Target: {goal.targetDate}</p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
