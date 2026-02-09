import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ColumnDto } from 'shared-types';
import { ColumnCreateRequest } from '../dto/column.create.request';
import { ColumnUpdateRequest } from '../dto/column.update.request';
import { ColumnsCoreService } from 'src/core/columns/service/columns.core.service';
import { ProjectAccessService } from 'src/core/projects/service/project-access.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ColumnMapper } from '../column.mapper';

@ApiTags('columns')
@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(
    private readonly columnsService: ColumnsCoreService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new column' })
  async create(
    @Session() session: UserSession,
    @Param('boardId') boardId: string,
    @Body() body: ColumnCreateRequest,
  ): Promise<ColumnDto> {
    await this.projectAccessService.assertBoardAccess(session.user.id, boardId);
    const column = await this.columnsService.createColumn(boardId, {
      name: body.name,
      color: body.color,
      position: body.position,
      limit: body.limit ?? undefined,
    });

    if (!column) {
      throw new NotFoundException('Board not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Get()
  @ApiOperation({ summary: 'List all columns in a board' })
  async list(
    @Session() session: UserSession,
    @Param('boardId') boardId: string,
  ): Promise<ColumnDto[]> {
    await this.projectAccessService.assertBoardAccess(session.user.id, boardId);
    const columns = await this.columnsService.getColumns(boardId);
    if (!columns) {
      throw new NotFoundException('Board not found');
    }

    return columns.map(ColumnMapper.toResponse);
  }

  @Get(':columnId')
  @ApiOperation({ summary: 'Get column by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
  ): Promise<ColumnDto> {
    await this.projectAccessService.assertColumnAccess(session.user.id, columnId);
    const column = await this.columnsService.getColumn(columnId);
    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Put(':columnId')
  @ApiOperation({ summary: 'Update column' })
  async update(
    @Session() session: UserSession,
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() body: ColumnUpdateRequest,
  ): Promise<ColumnDto> {
    await this.projectAccessService.assertColumnAccess(session.user.id, columnId);
    const column = await this.columnsService.updateColumn(columnId, {
      name: body.name,
      position: body.position,
      limit: body.limit,
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return ColumnMapper.toResponse(column);
  }

  @Delete(':columnId')
  @ApiOperation({ summary: 'Delete column' })
  async delete(
    @Session() session: UserSession,
    @Param('columnId') columnId: string,
  ): Promise<{ deleted: boolean }> {
    await this.projectAccessService.assertColumnAccess(session.user.id, columnId);
    const deleted = await this.columnsService.deleteColumn(columnId);

    if (!deleted) {
      throw new NotFoundException('Column not found');
    }

    return { deleted };
  }
}
