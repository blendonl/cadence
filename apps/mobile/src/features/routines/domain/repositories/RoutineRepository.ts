import { Routine, RoutineId, RoutineProps, RoutineType } from "../entities/Routine";

export interface RoutineRepository {
  loadRoutines(): Promise<Routine[]>;
  loadRoutineById(id: RoutineId): Promise<Routine | null>;
  createRoutine(
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[]
  ): Promise<Routine>;
  updateRoutine(id: RoutineId, updates: Partial<RoutineProps>): Promise<Routine>;
  deleteRoutine(id: RoutineId): Promise<boolean>;
  logTaskExecution(routineTaskId: string, userId: string, value?: string): Promise<void>;
}
