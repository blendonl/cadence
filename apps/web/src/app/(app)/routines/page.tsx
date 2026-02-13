'use client';

import { RoutineList } from '@/components/routines/routine-list';

export default function RoutinesPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-mono text-lg font-semibold">Routines</h2>
      <RoutineList />
    </div>
  );
}
