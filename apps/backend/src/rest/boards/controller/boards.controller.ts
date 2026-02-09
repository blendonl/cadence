import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BoardDetailDto, BoardDto } from 'shared-types';
import { BoardsCoreService } from 'src/core/boards/service/boards.core.service';
import { ProjectAccessService } from 'src/core/projects/service/project-access.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { BoardCreateRequest } from '../dto/board.create.request';
import { BoardListQuery } from '../dto/board.list.query';
import { BoardUpdateRequest } from '../dto/board.update.request';
import { BoardMapper } from '../board.mapper';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsCoreService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  async create(
    @Session() session: UserSession,
    @Body() body: BoardCreateRequest,
  ): Promise<BoardDto> {
    await this.projectAccessService.assertAccess(session.user.id, body.projectId);
    const board = await this.boardsService.createBoard({
      id: body.id,
      name: body.name,
      description: body.description || null,
      projectId: body.projectId,
    });

    return BoardMapper.mapToResponse(board);
  }

  @Get()
  @ApiOperation({ summary: 'List all boards' })
  async list(
    @Session() session: UserSession,
    @Query() query: BoardListQuery,
  ) {
    if (query.projectId) {
      await this.projectAccessService.assertAccess(session.user.id, query.projectId);
    }
    const result = await this.boardsService.getBoards({
      page: query.page,
      limit: query.limit,
      projectId: query.projectId,
      search: query.search,
    });

    return {
      items: result.items.map(BoardMapper.mapToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<BoardDetailDto> {
    await this.projectAccessService.assertBoardAccess(session.user.id, id);
    const board = await this.boardsService.getBoardById(id);

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return BoardMapper.mapToDetailResponse(board);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update board' })
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: BoardUpdateRequest,
  ): Promise<BoardDto> {
    await this.projectAccessService.assertBoardAccess(session.user.id, id);
    const board = await this.boardsService.updateBoard(id, {
      name: body.name,
      description: body.description,
    });

    if (board) {
      return BoardMapper.mapToResponse(board);
    }

    if (!body.projectId || !body.name) {
      throw new NotFoundException('Board not found');
    }

    await this.projectAccessService.assertAccess(session.user.id, body.projectId);
    const created = await this.boardsService.createBoard({
      id,
      name: body.name,
      description: body.description ?? null,
      projectId: body.projectId,
    });

    return BoardMapper.mapToResponse(created);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete board' })
  async delete(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<{ deleted: boolean }> {
    await this.projectAccessService.assertBoardAccess(session.user.id, id);
    const deleted = await this.boardsService.deleteBoard(id);
    if (!deleted) {
      throw new NotFoundException('Board not found');
    }
    return { deleted };
  }
}
