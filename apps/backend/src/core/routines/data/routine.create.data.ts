import { RoutineType } from '@prisma/client';

export interface RoutineCreateData {
  userId: string;
  name: string;
  type: RoutineType;
  target: string;
  separateInto?: number;
  repeatIntervalMinutes: number;
  activeDays?: string[];
}
