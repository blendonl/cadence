import { Inject, Injectable } from '@nestjs/common';
import { QuickTaskCreateData } from '../data/task.quick-create.data';
import { TaskCreateUseCase } from './task.create.usecase';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';
import { ProjectsCoreService } from 'src/core/projects/service/projects.core.service';
import { BoardsCoreService } from 'src/core/boards/service/boards.core.service';
import { ColumnsCoreService } from 'src/core/columns/service/columns.core.service';
import { GeneralProjectNotFoundError } from '../errors/general-project-not-found.error';
import { DefaultBoardNotFoundError } from '../errors/default-board-not-found.error';
import { DefaultColumnNotFoundError } from '../errors/default-column-not-found.error';

@Injectable()
export class TaskQuickCreateUseCase {
  constructor(
    private readonly projectsCoreService: ProjectsCoreService,
    private readonly boardsCoreService: BoardsCoreService,
    private readonly columnsCoreService: ColumnsCoreService,
    private readonly taskCreateUseCase: TaskCreateUseCase,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(data: QuickTaskCreateData) {
    const project = await this.projectsCoreService.findByName('General');
    if (!project) {
      throw new GeneralProjectNotFoundError();
    }

    const boardResult = await this.boardsCoreService.getBoards({
      projectId: project.id,
      page: 1,
      limit: 1,
    });
    if (boardResult.items.length === 0) {
      throw new DefaultBoardNotFoundError();
    }
    const board = boardResult.items[0];

    const columns = await this.columnsCoreService.getColumns(board.id);
    if (columns.length === 0) {
      throw new DefaultColumnNotFoundError();
    }
    const column = columns[0];

    const task = await this.taskCreateUseCase.execute({
      title: data.title,
      columnId: column.id,
      description: data.description,
      parentId: data.parentId ?? null,
      type: data.type,
      priority: data.priority,
      position: 0,
    });

    if (!task) {
      return null;
    }

    return this.taskRepository.findByIdWithRelations(task.id);
  }
}
