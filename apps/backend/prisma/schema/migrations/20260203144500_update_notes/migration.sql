-- Add tags column to notes
ALTER TABLE "note" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT '{}';

-- Update note_type enum values
ALTER TABLE "note" ALTER COLUMN "type" DROP DEFAULT;

CREATE TYPE "note_type_new" AS ENUM ('GENERAL', 'MEETING', 'DAILY', 'TASK');

ALTER TABLE "note"
  ALTER COLUMN "type" TYPE "note_type_new"
  USING (
    CASE
      WHEN "type" IN ('PERSONAL', 'WORK', 'STUDY', 'PROJECT') THEN 'GENERAL'::"note_type_new"
      WHEN "type" = 'MEETING' THEN 'MEETING'::"note_type_new"
      WHEN "type" = 'TASK' THEN 'TASK'::"note_type_new"
      ELSE 'GENERAL'::"note_type_new"
    END
  );

DROP TYPE "note_type";
ALTER TYPE "note_type_new" RENAME TO "note_type";
ALTER TABLE "note" ALTER COLUMN "type" SET DEFAULT 'GENERAL';

-- Note <-> Project relation
CREATE TABLE "_NoteToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_NoteToProject_AB_unique" ON "_NoteToProject"("A", "B");
CREATE INDEX "_NoteToProject_B_index" ON "_NoteToProject"("B");

ALTER TABLE "_NoteToProject" ADD CONSTRAINT "_NoteToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_NoteToProject" ADD CONSTRAINT "_NoteToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Board <-> Note relation
CREATE TABLE "_BoardToNote" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_BoardToNote_AB_unique" ON "_BoardToNote"("A", "B");
CREATE INDEX "_BoardToNote_B_index" ON "_BoardToNote"("B");

ALTER TABLE "_BoardToNote" ADD CONSTRAINT "_BoardToNote_A_fkey" FOREIGN KEY ("A") REFERENCES "boad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_BoardToNote" ADD CONSTRAINT "_BoardToNote_B_fkey" FOREIGN KEY ("B") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Note <-> Task relation
CREATE TABLE "_NoteToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_NoteToTask_AB_unique" ON "_NoteToTask"("A", "B");
CREATE INDEX "_NoteToTask_B_index" ON "_NoteToTask"("B");

ALTER TABLE "_NoteToTask" ADD CONSTRAINT "_NoteToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_NoteToTask" ADD CONSTRAINT "_NoteToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
