import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NoteDto, NoteDetailDto } from 'shared-types';
import { NotesCoreService } from 'src/core/notes/service/notes.core.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { NoteCreateRequest } from '../dto/note.create.request';
import { NoteUpdateRequest } from '../dto/note.update.request';
import { NotesListQuery } from '../dto/notes.list.query';
import { NoteMapper } from '../note.mapper';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesCoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  async create(
    @Session() session: UserSession,
    @Body() body: NoteCreateRequest,
  ): Promise<NoteDto> {
    const note = await this.notesService.createNote({
      userId: session.user.id,
      title: body.title,
      content: body.content ?? '',
      type: body.type,
      tags: body.tags ?? [],
      projectIds: body.projects?.map((project) => project.id),
      boardIds: body.boards?.map((board) => board.id),
      taskIds: body.tasks?.map((task) => task.id),
    });

    return NoteMapper.mapToResponse(note);
  }

  @Get()
  @ApiOperation({ summary: 'List notes' })
  async list(
    @Session() session: UserSession,
    @Query() query: NotesListQuery,
  ): Promise<NoteDetailDto[]> {
    const notes = await this.notesService.getNotes({
      userId: session.user.id,
      projectId: query.projectId,
      type: query.type,
    });

    return notes.map(NoteMapper.mapToDetailResponse);
  }

  @Get(':noteId')
  @ApiOperation({ summary: 'Get note by ID' })
  async getOne(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
  ): Promise<NoteDetailDto> {
    const note = await this.notesService.getNoteById(noteId, session.user.id);
    return NoteMapper.mapToDetailResponse(note);
  }

  @Put(':noteId')
  @ApiOperation({ summary: 'Update note' })
  async update(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
    @Body() body: NoteUpdateRequest,
  ): Promise<NoteDto> {
    const note = await this.notesService.updateNote(noteId, session.user.id, {
      title: body.title,
      content: body.content,
      type: body.type,
      tags: body.tags,
      projectIds: body.projects?.map((project) => project.id),
      boardIds: body.boards?.map((board) => board.id),
      taskIds: body.tasks?.map((task) => task.id),
    });

    return NoteMapper.mapToResponse(note!);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete note' })
  async delete(
    @Session() session: UserSession,
    @Param('noteId') noteId: string,
  ): Promise<{ deleted: boolean }> {
    await this.notesService.deleteNote(noteId, session.user.id);
    return { deleted: true };
  }
}
