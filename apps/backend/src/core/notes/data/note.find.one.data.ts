import { Prisma } from '@prisma/client';

export const noteWithRelationsInclude = {
  projects: true,
  boards: true,
  tasks: {
    include: {
      column: {
        include: {
          board: {
            include: {
              project: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.NoteInclude;

export type NoteFindOneData = Prisma.NoteGetPayload<{
  include: typeof noteWithRelationsInclude;
}>;
