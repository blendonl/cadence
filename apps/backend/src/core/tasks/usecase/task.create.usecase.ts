import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskCreateData } from '../data/task.create.data';
import { Task } from '@prisma/client';
import {
  TASK_REPOSITORY,
  type TaskRepository,
} from '../repository/task.repository';
import {
  COLUMN_REPOSITORY,
  type ColumnRepository,
} from 'src/core/columns/repository/column.repository';
import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from 'src/core/projects/repositories/project.repository';

@Injectable()
export class TaskCreateUseCase {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,
    @Inject(COLUMN_REPOSITORY)
    private readonly columnRepository: ColumnRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(data: TaskCreateData): Promise<Task | null> {
    const column = await this.columnRepository.findById(data.columnId);
    if (!column) {
      throw new NotFoundException(`Column with id ${data.columnId} not found`);
    }

    const columnWithProject = await this.columnRepository.findByIdWithProject(data.columnId);
    if (!columnWithProject?.board?.projectId) {
      throw new NotFoundException('Project not found for column');
    }

    const { slug: projectSlug, taskNumber } = await this.projectRepository.incrementTaskCounter(
      columnWithProject.board.projectId
    );

    const taskSlug = `${projectSlug}-${String(taskNumber).padStart(3, '0')}`;

    const taskCount = await this.taskRepository.countByColumnId(data.columnId);

    if (column.limit !== null && column.limit !== undefined) {
      if (taskCount >= column.limit) {
        throw new BadRequestException(
          `Column '${column.name}' is at capacity (${column.limit} tasks)`,
        );
      }
    }

    const task = await this.taskRepository.create({
      ...data,
      slug: taskSlug,
      taskNumber: taskNumber,
      position: taskCount,
    });

    return task;
  }
}
