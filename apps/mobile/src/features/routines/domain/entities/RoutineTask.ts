import { Timestamp } from "@core/types";

export type RoutineTaskId = string;

export interface RoutineTaskProps {
  id: RoutineTaskId;
  routineId: string;
  name: string;
  target: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

export class RoutineTask {
  id: RoutineTaskId;
  routineId: string;
  name: string;
  target: string;
  created_at: Timestamp;
  updated_at: Timestamp;

  constructor(props: RoutineTaskProps) {
    this.id = props.id;
    this.routineId = props.routineId;
    this.name = props.name;
    this.target = props.target;
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  toDict(): Record<string, any> {
    return {
      id: this.id,
      routineId: this.routineId,
      name: this.name,
      target: this.target,
      created_at: this.created_at instanceof Date ? this.created_at.toISOString() : this.created_at,
      updated_at: this.updated_at instanceof Date ? this.updated_at.toISOString() : this.updated_at,
    };
  }

  static fromDict(data: Record<string, any>): RoutineTask {
    return new RoutineTask({
      id: data.id,
      routineId: data.routineId,
      name: data.name,
      target: data.target,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
      updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }
}
