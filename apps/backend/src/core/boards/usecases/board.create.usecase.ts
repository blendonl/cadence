import { Inject, Injectable } from '@nestjs/common';
import { BoardCreateData } from '../data/board.create.data';
import { Board } from '../domain/board';
import {
  BOARD_REPOSITORY,
  type BoardRepository,
} from '../repositories/board.repository';

@Injectable()
export class BoardCreateUseCase {
  constructor(
    @Inject(BOARD_REPOSITORY)
    private readonly boardRepository: BoardRepository,
  ) {}

  async execute(data: BoardCreateData): Promise<Board> {
    const columnsToCreate =
      data.columns && data.columns.length > 0
        ? data.columns
        : this.getDefaultColumns();

    return this.boardRepository.create({
      ...data,
      columns: columnsToCreate,
    });
  }

  private getDefaultColumns() {
    return [
      { name: 'To Do', color: '#6B7280' },
      { name: 'In Progress', color: '#3B82F6' },
      { name: 'Done', color: '#10B981' },
    ];
  }
}
