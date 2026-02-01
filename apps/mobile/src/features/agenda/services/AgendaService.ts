import { inject, injectable } from "tsyringe";
import { API_CLIENT, TASK_SERVICE } from "@core/di/tokens";
import { ApiClient } from "@infrastructure/api/apiClient";
import { TaskService } from "@features/tasks/services/TaskService";
import {
  AgendaItemCreateRequestDto,
  AgendaItemEnrichedDto,
  PaginatedResponse,
  TaskDto,
} from "shared-types";
import { agendaApi } from "../api/agendaApi";

@injectable()
export class AgendaService {
  constructor(
    @inject(API_CLIENT) private readonly apiClient: ApiClient,
    @inject(TASK_SERVICE) private readonly taskService: TaskService,
  ) {}

  async getAllSchedulableTasks(
    searchQuery: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<TaskDto>> {
    return this.taskService.getTasks({
      search: searchQuery || undefined,
      page,
      limit,
    });
  }

  async createAgendaItem(
    request: AgendaItemCreateRequestDto,
  ): Promise<AgendaItemEnrichedDto> {
    return agendaApi.createAgendaItem(request);
  }
}
