import { useMemo } from 'react';
import { useRoutineListData } from './useRoutineListData';
import { Routine } from '../domain/entities/Routine';

export interface UseRoutineByTypeReturn {
  sleepRoutine: Routine | null;
  stepRoutine: Routine | null;
  otherRoutines: Routine[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useRoutineByType(): UseRoutineByTypeReturn {
  const { routines, loading, refresh } = useRoutineListData();

  const { sleepRoutine, stepRoutine, otherRoutines } = useMemo(() => {
    const sleep = routines.find((routine) => routine.type === 'SLEEP') || null;
    const step = routines.find((routine) => routine.type === 'STEP') || null;
    const others = routines.filter((routine) => routine.type === 'OTHER');

    return {
      sleepRoutine: sleep,
      stepRoutine: step,
      otherRoutines: others,
    };
  }, [routines]);

  return {
    sleepRoutine,
    stepRoutine,
    otherRoutines,
    loading,
    refresh,
  };
}
