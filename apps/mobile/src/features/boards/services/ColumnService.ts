import { injectable, inject } from "tsyringe";
import { Column } from "../domain/entities/Column";
import { ColumnRepository } from "../domain/repositories/ColumnRepository";
import { BoardId, ColumnId } from "@core/types";
import { COLUMN_REPOSITORY } from "@core/di/tokens";

@injectable()
export class ColumnService {
  constructor(
    @inject(COLUMN_REPOSITORY) private repository: ColumnRepository,
  ) {}

  async createColumn(
    boardId: BoardId,
    name: string,
    position?: number | null,
  ): Promise<Column> {
    return await this.repository.createColumn(boardId, {
      name,
      position: position ?? 0,
      limit: null,
    });
  }

  async deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    return await this.repository.deleteColumn(boardId, columnId);
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null },
  ): Promise<Column> {
    return await this.repository.updateColumn(boardId, columnId, updates);
  }
}
