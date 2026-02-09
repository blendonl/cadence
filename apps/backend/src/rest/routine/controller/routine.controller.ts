import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoutineDetailDto } from 'shared-types';
import { RoutinesCoreService } from 'src/core/routines/service/routines.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { RoutineCreateRequest } from '../dto/routine.create.request';
import { RoutineUpdateRequest } from '../dto/routine.update.request';
import { RoutineMapper } from '../routine.mapper';

@ApiTags('routines')
@Controller('routines')
export class RoutineController {
  constructor(private readonly routinesService: RoutinesCoreService) {}

  @Get()
  @ApiOperation({ summary: 'List all routines' })
  async list(@Session() session: UserSession): Promise<RoutineDetailDto[]> {
    const routines = await this.routinesService.getRoutines(session.user.id);
    return routines.map(RoutineMapper.toResponse);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new routine' })
  async create(
    @Session() session: UserSession,
    @Body() body: RoutineCreateRequest,
  ): Promise<RoutineDetailDto> {
    const routine = await this.routinesService.createRoutine({
      userId: session.user.id,
      name: body.name,
      type: body.type,
      target: body.target,
      separateInto: body.separateInto,
      repeatIntervalMinutes: body.repeatIntervalMinutes,
      activeDays: body.activeDays,
    });

    return RoutineMapper.toResponse(routine);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get routine by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<RoutineDetailDto> {
    const routine = await this.routinesService.getRoutine(id, session.user.id);
    return RoutineMapper.toResponse(routine);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update routine' })
  async update(
    @Session() session: UserSession,
    @Param('id') id: string,
    @Body() body: RoutineUpdateRequest,
  ): Promise<RoutineDetailDto> {
    await this.routinesService.updateRoutine(id, session.user.id, {
      name: body.name,
      status: body.status,
      type: body.type,
      target: body.target,
      separateInto: body.separateInto,
      repeatIntervalMinutes: body.repeatIntervalMinutes,
      activeDays: body.activeDays,
    });

    const routine = await this.routinesService.getRoutine(id, session.user.id);
    return RoutineMapper.toResponse(routine);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete routine' })
  async delete(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<{ deleted: boolean }> {
    await this.routinesService.deleteRoutine(id, session.user.id);
    return { deleted: true };
  }
}
