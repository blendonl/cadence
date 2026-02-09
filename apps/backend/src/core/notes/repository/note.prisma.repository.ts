import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NoteCreateData } from '../data/note.create.data';
import { NoteListQueryData } from '../data/note.list.query.data';
import { NoteUpdateData } from '../data/note.update.data';
import { NoteRepository } from './note.repository';
import { noteWithRelationsInclude, NoteFindOneData } from '../data/note.find.one.data';

@Injectable()
export class NotePrismaRepository implements NoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: NoteListQueryData): Promise<NoteFindOneData[]> {
    const where: any = { userId: query.userId };

    if (query.projectId) {
      where.projects = {
        some: {
          id: query.projectId,
        },
      };
    }

    if (query.type) {
      where.type = query.type;
    }

    return this.prisma.note.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: noteWithRelationsInclude,
    });
  }

  async findById(id: string): Promise<NoteFindOneData | null> {
    return this.prisma.note.findUnique({
      where: { id },
      include: noteWithRelationsInclude,
    });
  }

  async create(data: NoteCreateData): Promise<NoteFindOneData> {
    return this.prisma.note.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content ?? '',
        type: data.type,
        tags: data.tags ?? [],
        projects: data.projectIds
          ? {
              connect: data.projectIds.map((id) => ({ id })),
            }
          : undefined,
        boards: data.boardIds
          ? {
              connect: data.boardIds.map((id) => ({ id })),
            }
          : undefined,
        tasks: data.taskIds
          ? {
              connect: data.taskIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: noteWithRelationsInclude,
    });
  }

  async update(id: string, data: NoteUpdateData): Promise<NoteFindOneData | null> {
    return this.prisma.note.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content ?? undefined,
        type: data.type,
        tags: data.tags ?? undefined,
        projects: data.projectIds
          ? {
              set: data.projectIds.map((projectId) => ({ id: projectId })),
            }
          : undefined,
        boards: data.boardIds
          ? {
              set: data.boardIds.map((boardId) => ({ id: boardId })),
            }
          : undefined,
        tasks: data.taskIds
          ? {
              set: data.taskIds.map((taskId) => ({ id: taskId })),
            }
          : undefined,
      },
      include: noteWithRelationsInclude,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.note.delete({ where: { id } });
  }
}
