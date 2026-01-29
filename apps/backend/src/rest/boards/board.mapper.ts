import { Board, Column } from '@prisma/client';
import { BoardDetailDto, BoardDto } from 'shared-types';

type BoardWithColumns = Board & { columns?: Column[] };

export class BoardMapper {
  static mapToResponse(board: Board): BoardDto {
    return {
      id: board.id,
      name: board.name,
      slug: board.name.toLowerCase().replace(/\s+/g, '-'),
      description: board.description,
      color: '#3B82F6',
      projectId: board.projectId,
      filePath: null,
      createdAt: board.createdAt.toISOString(),
      updatedAt: board.updatedAt.toISOString(),
    };
  }

  static mapToDetailResponse(board: BoardWithColumns): BoardDetailDto {
    return {
      ...this.mapToResponse(board),
      columns: (board.columns || []).map((column) => ({
        id: column.id,
        name: column.name,
        position: column.position,
        taskCount: 0,
      })),
      projectName: '',
    };
  }
}
