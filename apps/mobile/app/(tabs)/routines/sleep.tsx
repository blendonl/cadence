import React from 'react';
import { SingleRoutineScreen } from '@features/routines/components/SingleRoutineScreen';

export default function SleepRoutineScreen() {
  return (
    <SingleRoutineScreen
      routineType="SLEEP"
      subtitle="Track your sleep window and patterns."
      placeholders={[
        {
          title: 'Typical sleep window',
          subtitle: 'Add patterns from recent logs',
          helper: 'This section will populate when sleep logs are available.',
        },
        {
          title: 'Recent sleep logs',
          subtitle: 'No logs yet',
          helper: 'Sleep sessions will appear here once endpoints are connected.',
        },
      ]}
    />
  );
}
