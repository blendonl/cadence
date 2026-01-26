import { injectable, inject } from "tsyringe";
import { Routine, RoutineId, RoutineProps, RoutineType } from "../domain/entities/Routine";
import { RoutineTask } from "../domain/entities/RoutineTask";
import { RoutineRepository } from "../domain/repositories/RoutineRepository";
import { BackendApiClient } from "@infrastructure/api/BackendApiClient";
import { BACKEND_API_CLIENT } from "@core/di/tokens";
import { RoutineDetailDto } from "shared-types";

@injectable()
export class BackendRoutineRepository implements RoutineRepository {
  constructor(
    @inject(BACKEND_API_CLIENT) private readonly apiClient: BackendApiClient,
  ) {}

  async loadRoutines(): Promise<Routine[]> {
    const response = await this.apiClient.request<RoutineDetailDto[]>("/routines");
    return response.map((item) => this.mapRoutine(item));
  }

  async loadRoutineById(id: RoutineId): Promise<Routine | null> {
    const data = await this.apiClient.requestOrNull<RoutineDetailDto>(
      `/routines/${id}`,
    );
    if (!data) {
      return null;
    }
    return this.mapRoutine(data);
  }

  async createRoutine(
    name: string,
    type: RoutineType,
    target: string,
    separateInto?: number,
    repeatIntervalMinutes?: number,
    activeDays?: string[],
  ): Promise<Routine> {
    const payload: Record<string, any> = {
      name,
      type,
      target,
    };

    if (separateInto !== undefined) {
      payload.separateInto = separateInto;
    }

    if (repeatIntervalMinutes !== undefined) {
      payload.repeatIntervalMinutes = repeatIntervalMinutes;
    }

    if (activeDays !== undefined) {
      payload.activeDays = activeDays;
    }

    const data = await this.apiClient.request<RoutineDetailDto>("/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return this.mapRoutine(data);
  }

  async updateRoutine(id: RoutineId, updates: Partial<RoutineProps>): Promise<Routine> {
    const payload: Record<string, any> = {};

    if (updates.name !== undefined) {
      payload.name = updates.name;
    }

    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (updates.target !== undefined) {
      payload.target = updates.target;
    }

    if (updates.separateInto !== undefined) {
      payload.separateInto = updates.separateInto;
    }

    if (updates.repeatIntervalMinutes !== undefined) {
      payload.repeatIntervalMinutes = updates.repeatIntervalMinutes;
    }

    if (updates.activeDays !== undefined) {
      payload.activeDays = updates.activeDays;
    }

    const data = await this.apiClient.request<RoutineDetailDto>(
      `/routines/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    return this.mapRoutine(data);
  }

  async deleteRoutine(id: RoutineId): Promise<boolean> {
    await this.apiClient.request(`/routines/${id}`, {
      method: "DELETE",
    });
    return true;
  }

  async logTaskExecution(
    routineTaskId: string,
    userId: string,
    value?: string,
  ): Promise<void> {
    const payload = {
      routineTaskId,
      userId,
      value: value || undefined,
      executedAt: new Date().toISOString(),
    };

    await this.apiClient.request("/routine-task-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  private mapRoutine(dto: RoutineDetailDto): Routine {
    return new Routine({
      id: dto.id,
      name: dto.name,
      status: dto.isActive ? 'ACTIVE' : 'DISABLED',
      type: dto.routineType as any,
      target: dto.target ? dto.target.toString() : '0',
      separateInto: 1,
      repeatIntervalMinutes: 0,
      activeDays: null,
      created_at: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updated_at: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
      tasks: dto.tasks ? dto.tasks.map((t) => this.mapRoutineTask(t)) : undefined,
    });
  }

  private mapRoutineTask(dto: any): RoutineTask {
    return new RoutineTask({
      id: dto.id,
      routineId: dto.routineId,
      name: dto.name,
      target: '0',
      created_at: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updated_at: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    });
  }
}
