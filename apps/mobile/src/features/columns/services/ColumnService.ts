import { injectable, inject } from "tsyringe";
import { BoardId, ColumnId } from "@core/types";
import { API_CLIENT } from "@core/di/tokens";
import { getEventBus } from "@core/EventBus";
import { ApiClient } from "@infrastructure/api/apiClient";
import { ColumnDto, ColumnCreateRequestDto } from "shared-types";
import { createColumnApi } from "@cadence/api";

@injectable()
export class ColumnService {
  private columnApi;

  constructor(
    @inject(API_CLIENT) private apiClient: ApiClient,
  ) {
    this.columnApi = createColumnApi(apiClient);
  }

  async getColumnById(columnId: ColumnId): Promise<ColumnDto | null> {
    return this.columnApi.getColumnById(columnId);
  }

  async createColumn(
    boardId: BoardId,
    name: string,
    position?: number | null,
  ): Promise<ColumnDto> {
    const payload: ColumnCreateRequestDto = {
      name,
      position: position ?? 0,
      boardId,
      wipLimit: undefined,
    };
    return this.columnApi.createColumn(payload);
  }

  async deleteColumn(boardId: BoardId, columnId: ColumnId): Promise<boolean> {
    await this.columnApi.deleteColumn(columnId);
    return true;
  }

  async updateColumn(
    boardId: BoardId,
    columnId: ColumnId,
    updates: { name?: string; position?: number; limit?: number | null },
  ): Promise<ColumnDto> {
    return this.columnApi.updateColumn(columnId, {
      name: updates.name,
      position: updates.position,
      wipLimit: updates.limit,
    });
  }

  async reorderColumn(
    boardId: BoardId,
    columnId: ColumnId,
    direction: "left" | "right"
  ): Promise<void> {
    await getEventBus().publish("column_reordered", {
      boardId,
      columnId,
      direction,
      timestamp: new Date(),
    });
  }

  async clearColumn(boardId: BoardId, columnId: ColumnId): Promise<void> {
    await getEventBus().publish("column_cleared", {
      boardId,
      columnId,
      timestamp: new Date(),
    });
  }
}
