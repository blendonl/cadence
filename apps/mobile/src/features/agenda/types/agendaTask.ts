import { TaskDto } from "shared-types";
import { TaskScheduleFields } from "@features/tasks/types/taskSchedule";

export interface TaskMetricsFields {
  target_value?: number;
  value_unit?: string;
}

export type AgendaTask = TaskDto & TaskScheduleFields & TaskMetricsFields;
