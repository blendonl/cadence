import { Timestamp } from "@core/types";
import { now } from "@utils/dateUtils";
import { RoutineTask } from "./RoutineTask";

export type RoutineId = string;
export type RoutineStatus = 'ACTIVE' | 'DISABLED';
export type RoutineType = 'SLEEP' | 'STEP' | 'OTHER';

export interface RoutineProps {
  id?: RoutineId;
  name: string;
  status?: RoutineStatus;
  type: RoutineType;
  target: string;
  separateInto?: number;
  repeatIntervalMinutes?: number;
  activeDays?: string[] | null;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  tasks?: RoutineTask[];
}

export class Routine {
  id: RoutineId;
  name: string;
  status: RoutineStatus;
  type: RoutineType;
  target: string;
  separateInto: number;
  repeatIntervalMinutes: number;
  activeDays: string[] | null;
  created_at: Timestamp;
  updated_at: Timestamp;
  tasks: RoutineTask[];

  constructor(props: RoutineProps) {
    this.id = props.id || "";
    this.name = props.name;
    this.status = props.status || "ACTIVE";
    this.type = props.type;
    this.target = props.target;
    this.separateInto = props.separateInto || 1;
    this.repeatIntervalMinutes = props.repeatIntervalMinutes || 1440; // Default: daily
    this.activeDays = props.activeDays !== undefined ? props.activeDays : null;
    this.created_at = props.created_at || now();
    this.updated_at = props.updated_at || now();
    this.tasks = props.tasks || [];
  }

  update(updates: Partial<RoutineProps>): void {
    const allowedFields = ["name", "target", "separateInto", "repeatIntervalMinutes", "activeDays"];
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        (this as any)[key] = value;
      }
    });
    this.updated_at = now();
  }

  activate(): void {
    this.status = "ACTIVE";
    this.updated_at = now();
  }

  disable(): void {
    this.status = "DISABLED";
    this.updated_at = now();
  }

  get isActive(): boolean {
    return this.status === "ACTIVE";
  }

  get isDisabled(): boolean {
    return this.status === "DISABLED";
  }

  get taskCount(): number {
    return this.tasks.length;
  }

  toDict(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      type: this.type,
      target: this.target,
      separateInto: this.separateInto,
      repeatIntervalMinutes: this.repeatIntervalMinutes,
      activeDays: this.activeDays,
      created_at: this.created_at instanceof Date ? this.created_at.toISOString() : this.created_at,
      updated_at: this.updated_at instanceof Date ? this.updated_at.toISOString() : this.updated_at,
      tasks: this.tasks.map(task => task.toDict()),
    };
  }

  static fromDict(data: Record<string, any>): Routine {
    return new Routine({
      id: data.id,
      name: data.name,
      status: data.status,
      type: data.type,
      target: data.target,
      separateInto: data.separateInto,
      repeatIntervalMinutes: data.repeatIntervalMinutes,
      activeDays: data.activeDays,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
      tasks: data.tasks ? data.tasks.map((t: any) => RoutineTask.fromDict(t)) : undefined,
    });
  }
}
