import React from 'react';
import { SingleRoutineScreen } from '@features/routines/components/SingleRoutineScreen';

export default function StepsRoutineScreen() {
  return (
    <SingleRoutineScreen
      routineType="STEP"
      subtitle="Track your daily step goal and progress."
      placeholders={[
        {
          title: "Today's progress",
          subtitle: '0 steps logged',
          helper: 'Progress data will appear when step endpoints are connected.',
        },
        {
          title: 'Weekly trend',
          subtitle: 'No weekly data yet',
          helper: 'Weekly charts will appear once history is available.',
        },
      ]}
    />
  );
}
