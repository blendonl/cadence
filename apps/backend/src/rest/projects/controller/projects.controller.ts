import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ProjectDto,
  ProjectDetailDto,
  ProjectListResponseDto,
} from 'shared-types';
import { ProjectsCoreService } from 'src/core/projects/service/projects.core.service';
import { ProjectAccessService } from 'src/core/projects/service/project-access.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ProjectCreateRequest } from '../dto/project.create.request';
import { ProjectListQuery } from '../dto/project.list.query';
import { ProjectMapper } from '../project.mapper';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsCoreService,
    private readonly projectAccessService: ProjectAccessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: 'ProjectDto',
  })
  async create(
    @Session() session: UserSession,
    @Body() body: ProjectCreateRequest,
  ): Promise<ProjectDto> {
    const project = await this.projectsService.createProject({
      userId: session.user.id,
      name: body.name,
      description: body.description || null,
      color: body.color,
      status: body.status,
    });

    return ProjectMapper.mapToResponse(project);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiResponse({
    status: 200,
    description: 'Projects list',
    type: 'ProjectListResponseDto',
  })
  async list(
    @Session() session: UserSession,
    @Query() query: ProjectListQuery,
  ): Promise<ProjectListResponseDto> {
    const result = await this.projectsService.getProjects({
      userId: session.user.id,
      page: query.page,
      limit: query.limit,
      status: query.status,
      search: query.search,
    });

    return {
      items: result.items.map(ProjectMapper.mapToResponse),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID with details' })
  @ApiResponse({
    status: 200,
    description: 'Project details',
    type: 'ProjectDetailDto',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<ProjectDetailDto> {
    await this.projectAccessService.assertAccess(session.user.id, id);
    const project = await this.projectsService.getProjectByIdWithDetails(id);

    if (!project) {
      throw new Error('Project not found');
    }

    return ProjectMapper.mapToDetailResponse(project);
  }
}
