import { Board } from "../entities/Board";
import { BoardId, ProjectId } from "@core/types";

export interface BoardRepository {
  loadBoardsByProjectId(projectId: ProjectId): Promise<Board[]>;

  loadAllBoards(): Promise<Board[]>;

  loadBoardById(boardId: BoardId): Promise<Board | null>;

  saveBoard(data: {
    name: string;
    description: string;
    projectId: string;
  }): Promise<Board>;

  deleteBoard(boardId: BoardId): Promise<boolean>;
}
