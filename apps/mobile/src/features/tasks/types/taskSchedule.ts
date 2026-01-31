import { TaskDto } from "shared-types";
import { RecurrenceRule } from "@shared/types/recurrence";

export interface TaskScheduleFields {
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  time_block_minutes?: number | null;
  task_type?: string | null;
  meeting_data?: {
    location?: string;
    attendees?: string[];
  } | null;
  recurrence?: RecurrenceRule | null;
}

export type TaskWithSchedule = TaskDto & TaskScheduleFields;
