import { injectable, inject } from "tsyringe";
import { BoardId, ProjectId } from "@core/types";
import { BoardNotFoundError, ValidationError } from "@core/exceptions";
import { getEventBus } from "@core/EventBus";
import logger from "@utils/logger";
import { BoardDto, BoardDetailDto } from "shared-types";
import { ApiClient } from "@infrastructure/api/apiClient";
import { createBoardApi } from "@cadence/api";

import { API_CLIENT } from "@core/di/tokens";

@injectable()
export class BoardService {
  private boardApi;

  constructor(
    @inject(API_CLIENT) private apiClient: ApiClient
  ) {
    this.boardApi = createBoardApi(apiClient);
  }

  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Board name cannot be empty");
    }
  }

  async getBoardsByProject(projectId: ProjectId): Promise<BoardDto[]> {
    return this.boardApi.getBoardsByProject(projectId);
  }

  async getAllBoards(): Promise<BoardDto[]> {
    return this.boardApi.getAllBoards();
  }

  async getBoardById(boardId: BoardId): Promise<BoardDetailDto> {
    logger.info('[BoardService] getBoardById called', { boardId });
    const board = await this.boardApi.getBoardById(boardId);

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

    const board = await this.boardApi.createBoard({ projectId, name, description });

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
    await this.boardApi.deleteBoard(boardId);

    await getEventBus().publish("board_deleted", {
      boardId,
      boardName: boardId,
      timestamp: new Date(),
    });

    return true;
  }

}
