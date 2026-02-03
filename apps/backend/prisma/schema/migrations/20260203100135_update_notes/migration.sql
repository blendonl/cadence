-- AlterTable
ALTER TABLE "_BoardToNote" ADD CONSTRAINT "_BoardToNote_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_BoardToNote_AB_unique";

-- AlterTable
ALTER TABLE "_NoteToProject" ADD CONSTRAINT "_NoteToProject_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NoteToProject_AB_unique";

-- AlterTable
ALTER TABLE "_NoteToTask" ADD CONSTRAINT "_NoteToTask_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_NoteToTask_AB_unique";
