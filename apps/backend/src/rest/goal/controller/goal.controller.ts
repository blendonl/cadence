import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoalDto } from 'shared-types';
import { GoalsCoreService } from 'src/core/goals/service/goals.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { GoalCreateRequest } from '../dto/goal.create.request';
import { GoalUpdateRequest } from '../dto/goal.update.request';
import { GoalMapper } from '../goal.mapper';

@ApiTags('goals')
@Controller('goals')
export class GoalController {
  constructor(private readonly goalsService: GoalsCoreService) {}

  @Get()
  @ApiOperation({ summary: 'List all goals' })
  async list(@Session() session: UserSession): Promise<GoalDto[]> {
    const goals = await this.goalsService.getGoals(session.user.id);
    return goals.map(GoalMapper.toResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  async create(
    @Session() session: UserSession,
    @Body() body: GoalCreateRequest,
  ): Promise<GoalDto> {
    const goal = await this.goalsService.createGoal({
      userId: session.user.id,
      title: body.title,
      description: body.description,
    });
    return GoalMapper.toResponse(goal);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GoalDto> {
    const goal = await this.goalsService.getGoal(id, session.user.id);
    return GoalMapper.toResponse(goal);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update goal' })
  async update(
    @Session() session: UserSession,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: GoalUpdateRequest,
  ): Promise<GoalDto> {
    const goal = await this.goalsService.updateGoal(id, session.user.id, {
      title: body.title,
      description: body.description,
    });
    return GoalMapper.toResponse(goal);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  async delete(
    @Session() session: UserSession,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.goalsService.deleteGoal(id, session.user.id);
    return { deleted: true };
  }
}
