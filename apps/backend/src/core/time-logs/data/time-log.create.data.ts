export class TimeLogCreateData {
  userId: string;
  projectId?: string;
  taskId?: string;
  date: Date;
  durationMinutes: number;
  source: string;
  metadata?: Record<string, any>;
}
