import { injectable, inject } from "tsyringe";
import { BoardId, ProjectId } from "@core/types";
import { BoardNotFoundError, ValidationError } from "@core/exceptions";
import { getEventBus } from "@core/EventBus";
import logger from "@utils/logger";
import { BoardDto, BoardDetailDto, BoardListResponseDto } from "shared-types";
import { ApiClient } from "@infrastructure/api/apiClient";

import { API_CLIENT } from "@core/di/tokens";

@injectable()
export class BoardService {
  constructor(
    @inject(API_CLIENT) private apiClient: ApiClient
  ) {}

  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Board name cannot be empty");
    }
  }

  async getBoardsByProject(projectId: ProjectId): Promise<BoardDto[]> {
    const response = await this.apiClient.request<BoardListResponseDto | null>(
      `/boards?projectId=${projectId}`
    );
    if (!response || !Array.isArray(response.items)) {
      logger.warn('[BoardService] Unexpected board list response', { projectId, response });
      return [];
    }
    return response.items;
  }

  async getAllBoards(): Promise<BoardDto[]> {
    const response = await this.apiClient.request<BoardListResponseDto | null>(`/boards`);
    if (!response || !Array.isArray(response.items)) {
      logger.warn('[BoardService] Unexpected board list response', { response });
      return [];
    }
    return response.items;
  }

  async getBoardById(boardId: BoardId): Promise<BoardDetailDto> {
    logger.info('[BoardService] getBoardById called', { boardId });
    const board = await this.apiClient.requestOrNull<BoardDetailDto>(`/boards/${boardId}`);

    if (!board) {
      logger.warn('[BoardService] Board not found', { boardId });
      throw new BoardNotFoundError(`Board with id '${boardId}' not found`);
    }

    logger.info('[BoardService] Board retrieved from API', {
      boardId,
      boardName: board.name,
      columnsCount: board.columns?.length
    });

    await getEventBus().publish("board_loaded", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  async createBoardInProject(
    projectId: ProjectId,
    name: string,
    description: string = "",
  ): Promise<BoardDto> {
    this.validateBoardName(name);

    const board = await this.apiClient.request<BoardDto>(`/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, projectId }),
    });

    await getEventBus().publish("board_created", {
      boardId: board.id,
      boardName: board.name,
      timestamp: new Date(),
    });

    return board;
  }

  async canDeleteBoard(boardId: BoardId): Promise<boolean> {
    const board = await this.getBoardById(boardId);
    return board.columns?.every((col) => col.tasks.length === 0) ?? true;
  }

  async deleteBoard(boardId: BoardId): Promise<boolean> {
    await this.apiClient.request<{ deleted: boolean }>(`/boards/${boardId}`, {
      method: "DELETE",
    });

    await getEventBus().publish("board_deleted", {
      boardId,
      boardName: boardId,
      timestamp: new Date(),
    });

    return true;
  }

}
