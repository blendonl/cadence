import { injectable, inject } from "tsyringe";
import { TaskId, ParentId } from "@core/types";
import { ValidationError } from "@core/exceptions";
import { TaskDto, TaskDetailDto, TaskCreateRequestDto, TaskCreateResponseDto, TaskUpdateRequestDto, TaskPriorityType, PaginatedResponse, QuickTaskCreateRequestDto } from "shared-types";
import { API_CLIENT } from "@core/di/tokens";
import { ApiClient } from "@infrastructure/api/apiClient";

@injectable()
export class TaskService {
  constructor(
    @inject(API_CLIENT) private readonly apiClient: ApiClient,
  ) {}

  async getAllTasks(query: { projectId?: string; boardId?: string } = {}): Promise<TaskDto[]> {
    const params = new URLSearchParams();
    if (query.projectId) params.append("projectId", query.projectId);
    if (query.boardId) params.append("boardId", query.boardId);

    const queryString = params.toString();
    return await this.apiClient.request<TaskDto[]>(`/tasks${queryString ? `?${queryString}` : ""}`);
  }

  async getTasks(query: {
    projectId?: string;
    boardId?: string;
    columnId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<TaskDto>> {
    const params = new URLSearchParams();
    if (query.projectId) params.append("projectId", query.projectId);
    if (query.boardId) params.append("boardId", query.boardId);
    if (query.columnId) params.append("columnId", query.columnId);
    if (query.search) params.append("search", query.search);
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    const queryString = params.toString();
    return await this.apiClient.request<PaginatedResponse<TaskDto>>(
      `/tasks${queryString ? `?${queryString}` : ""}`
    );
  }

  async createTask(params: TaskCreateRequestDto): Promise<TaskCreateResponseDto> {
    return await this.apiClient.request<TaskCreateResponseDto>(`/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }

  async updateTask(taskId: TaskId, updates: TaskUpdateRequestDto): Promise<TaskDto> {
    return await this.apiClient.request<TaskDto>(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: TaskId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/tasks/${taskId}`, {
      method: "DELETE",
    });
    return true;
  }

  async moveTaskBetweenColumns(
    taskId: TaskId,
    targetColumnId: string,
  ): Promise<boolean> {
    await this.updateTask(taskId, { columnId: targetColumnId });
    return true;
  }

  async setTaskParent(taskId: TaskId, parentId: ParentId): Promise<boolean> {
    await this.updateTask(taskId, { parentId });
    return true;
  }

  async setTaskPriority(taskId: TaskId, priority: TaskPriorityType): Promise<void> {
    await this.updateTask(taskId, { priority });
  }

  async quickCreateTask(params: QuickTaskCreateRequestDto): Promise<TaskDto> {
    return await this.apiClient.request<TaskDto>(`/tasks/quick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }

  async getTaskDetail(taskId: TaskId): Promise<TaskDetailDto | null> {
    return await this.apiClient.requestOrNull<TaskDetailDto>(`/tasks/${taskId}`);
  }
}
