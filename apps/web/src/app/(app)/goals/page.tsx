'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GoalList } from '@/components/goals/goal-list';
import { GoalForm } from '@/components/goals/goal-form';

export default function GoalsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg font-semibold">Goals</h2>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New Goal
        </Button>
      </div>
      <GoalList />
      <GoalForm open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
