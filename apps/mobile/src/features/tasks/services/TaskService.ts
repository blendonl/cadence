import { injectable, inject } from "tsyringe";
import { TaskId, ParentId } from "@core/types";
import { TaskDto, TaskDetailDto, TaskCreateRequestDto, TaskCreateResponseDto, TaskUpdateRequestDto, TaskPriorityType, PaginatedResponse, QuickTaskCreateRequestDto } from "shared-types";
import { API_CLIENT } from "@core/di/tokens";
import { ApiClient } from "@infrastructure/api/apiClient";
import { createTaskApi } from "@cadence/api";

@injectable()
export class TaskService {
  private taskApi;

  constructor(
    @inject(API_CLIENT) private readonly apiClient: ApiClient,
  ) {
    this.taskApi = createTaskApi(apiClient);
  }

  async getAllTasks(query: { projectId?: string; boardId?: string } = {}): Promise<TaskDto[]> {
    return this.taskApi.getAllTasks(query);
  }

  async getTasks(query: {
    projectId?: string;
    boardId?: string;
    columnId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<TaskDto>> {
    return this.taskApi.getTasks(query);
  }

  async createTask(params: TaskCreateRequestDto): Promise<TaskCreateResponseDto> {
    return this.taskApi.createTask(params);
  }

  async updateTask(taskId: TaskId, updates: TaskUpdateRequestDto): Promise<TaskDto> {
    return this.taskApi.updateTask(taskId, updates);
  }

  async deleteTask(taskId: TaskId): Promise<boolean> {
    await this.taskApi.deleteTask(taskId);
    return true;
  }

  async moveTaskBetweenColumns(
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<boolean> {
    await this.taskApi.updateTask(taskId, { columnId: targetColumnId });
    return true;
  }

  async setTaskParent(taskId: TaskId, parentId: ParentId): Promise<boolean> {
    await this.taskApi.updateTask(taskId, { parentId });
    return true;
  }

  async setTaskPriority(taskId: TaskId, priority: TaskPriorityType): Promise<void> {
    await this.taskApi.updateTask(taskId, { priority });
  }

  async quickCreateTask(params: QuickTaskCreateRequestDto): Promise<TaskDto> {
    return this.taskApi.quickCreateTask(params);
  }

  async getTaskDetail(taskId: TaskId): Promise<TaskDetailDto | null> {
    return this.taskApi.getTaskDetail(taskId);
  }
}
