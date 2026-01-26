import { injectable, inject } from "tsyringe";
import { Board } from "../domain/entities/Board";
import { BoardRepository } from "../domain/repositories/BoardRepository";
import { BoardId, ProjectId } from "@core/types";
import { BoardNotFoundError, ValidationError } from "@core/exceptions";
import { getEventBus } from "@core/EventBus";

import { BOARD_REPOSITORY } from "@core/di/tokens";

@injectable()
export class BoardService {
  constructor(
    @inject(BOARD_REPOSITORY) private repository: BoardRepository,
  ) {}

  private validateBoardName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError("Board name cannot be empty");
    }
  }

  async getBoardsByProject(projectId: ProjectId): Promise<Board[]> {
    return await this.repository.loadBoardsByProjectId(projectId);
  }

  async getAllBoards(): Promise<Board[]> {
    return await this.repository.loadAllBoards();
  }

  async getBoardById(boardId: BoardId): Promise<Board> {
    const board = await this.repository.loadBoardById(boardId);

    if (!board) {
      throw new BoardNotFoundError(`Board with id '${boardId}' not found`);
    }

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
  ): Promise<Board> {
    this.validateBoardName(name);

    const board = await this.repository.saveBoard({
      name,
      description,
      projectId,
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
    const deleted = await this.repository.deleteBoard(boardId);

    if (deleted) {
      await getEventBus().publish("board_deleted", {
        boardId,
        boardName: boardId,
        timestamp: new Date(),
      });
    }

    return deleted;
  }

  async getBoardsByIds(boardIds: Set<BoardId>): Promise<Map<BoardId, Board>> {
    const boards = new Map<BoardId, Board>();

    const results = await Promise.all(
      Array.from(boardIds).map(async (boardId) => {
        try {
          const board = await this.repository.loadBoardById(boardId);
          return { boardId, board };
        } catch (error) {
          return { boardId, board: null };
        }
      }),
    );

    results.forEach(({ boardId, board }) => {
      if (board) {
        boards.set(boardId, board);
      }
    });

    return boards;
  }
}
