import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  TaskDto,
  TaskLogDto,
  WorkDurationDto,
  PaginatedResponse,
} from 'shared-types';
import { TaskCreateRequest } from '../dto/task.create.request';
import { TaskQuickCreateRequest } from '../dto/task.quick-create.request';
import { TaskUpdateRequest } from '../dto/task.update.request';
import { TaskListQueryRequest } from '../dto/task.list.query.request';
import { TasksCoreService } from 'src/core/tasks/service/tasks.core.service';
import { TaskLogsCoreService } from 'src/core/task-logs/service/task-logs.core.service';
import { ProjectAccessService } from 'src/core/projects/service/project-access.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { TaskMapper } from '../task.mapper';
import { TaskLogMapper } from '../task-log.mapper';
import { TaskFindOneResponse } from '../dto/task.find.one.response';
import { TaskCreateResponse } from '../dto/task.create.response';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksCoreService,
    private readonly taskLogsService: TaskLogsCoreService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  @Post('quick')
  @ApiOperation({ summary: 'Quick create a task in the General project' })
  async quickCreate(
    @Session() session: UserSession,
    @Body() body: TaskQuickCreateRequest,
  ): Promise<TaskDto> {
    const task = await this.tasksService.quickCreateTask({
      title: body.title,
      description: body.description,
      parentId: body.parentId ?? null,
      type: body.taskType,
      priority: body.priority as any,
    });

    return TaskMapper.toResponse(task);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Session() session: UserSession,
    @Body() body: TaskCreateRequest,
  ): Promise<TaskCreateResponse> {
    await this.projectAccessService.assertColumnAccess(session.user.id, body.columnId);
    const task = await this.tasksService.createTask({
      title: body.title,
      columnId: body.columnId,
      description: body.description,
      parentId: body.parentId ?? null,
      type: body.taskType,
      priority: body.priority as any,
      position: 0,
    });

    if (!task) {
      throw new NotFoundException('Column not found');
    }

    return TaskCreateResponse.fromDomain(task);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with pagination' })
  async list(
    @Session() session: UserSession,
    @Query() query: TaskListQueryRequest,
  ): Promise<PaginatedResponse<TaskDto>> {
    if (query.boardId) {
      await this.projectAccessService.assertBoardAccess(session.user.id, query.boardId);
    }
    if (query.columnId) {
      await this.projectAccessService.assertColumnAccess(session.user.id, query.columnId);
    }
    const result = await this.tasksService.getTasks({
      boardId: query.boardId,
      columnId: query.columnId,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 50,
    });

    return {
      items: result.items.map(TaskMapper.toResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get task by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
  ): Promise<TaskFindOneResponse> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const task = await this.tasksService.getTask(taskId);

    return TaskFindOneResponse.fromDomain(task);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update task' })
  async update(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
    @Body() body: TaskUpdateRequest,
  ): Promise<TaskDto> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const task = await this.tasksService.updateTask(taskId, {
      title: body.title,
      columnId: body.columnId,
      parentId: body.parentId ?? null,
      description: body.description,
      type: body.taskType as any,
      priority: body.priority as any,
      position: body.position,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return TaskMapper.toResponse(task);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete task' })
  async delete(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
  ): Promise<{ deleted: boolean }> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const deleted = await this.tasksService.deleteTask(taskId);
    if (!deleted) {
      throw new NotFoundException('Task not found');
    }

    return { deleted };
  }

  @Post(':taskId/move')
  @ApiOperation({ summary: 'Move task to another column' })
  async moveTask(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
    @Body() body: { targetColumnId: string },
  ): Promise<TaskDto> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const task = await this.tasksService.moveTask(taskId, body.targetColumnId);
    return TaskMapper.toResponse(task);
  }

  @Get(':taskId/work-duration')
  @ApiOperation({ summary: 'Get task work duration' })
  async getWorkDuration(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
  ): Promise<WorkDurationDto | null> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const duration = await this.taskLogsService.getWorkDuration(taskId);
    if (!duration) {
      return null;
    }
    return TaskLogMapper.toWorkDurationResponse(duration);
  }

  @Get(':taskId/logs')
  @ApiOperation({ summary: 'Get task logs' })
  async getTaskLogs(
    @Session() session: UserSession,
    @Param('taskId') taskId: string,
  ): Promise<TaskLogDto[]> {
    await this.projectAccessService.assertTaskAccess(session.user.id, taskId);
    const logs = await this.taskLogsService.getTaskHistory(taskId);
    return logs.map(TaskLogMapper.toResponse);
  }
}
