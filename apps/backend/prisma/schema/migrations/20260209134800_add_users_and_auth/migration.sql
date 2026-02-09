-- CreateEnum
CREATE TYPE "member_role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "google_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- Insert seed user
INSERT INTO "user" ("id", "email", "name", "google_id", "created_at", "updated_at")
VALUES ('00000000-0000-0000-0000-000000000001', 'seed@local', 'Seed User', 'seed-google-id', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add user_id columns as nullable first
ALTER TABLE "agenda" ADD COLUMN "user_id" TEXT;
ALTER TABLE "goal" ADD COLUMN "user_id" TEXT;
ALTER TABLE "note" ADD COLUMN "user_id" TEXT;
ALTER TABLE "project" ADD COLUMN "user_id" TEXT;
ALTER TABLE "project" ADD COLUMN "team_id" TEXT;
ALTER TABLE "routine" ADD COLUMN "user_id" TEXT;
ALTER TABLE "time_log" ADD COLUMN "user_id" TEXT;

-- Backfill existing rows with seed user
UPDATE "agenda" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "goal" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "note" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "project" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "routine" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;
UPDATE "time_log" SET "user_id" = '00000000-0000-0000-0000-000000000001' WHERE "user_id" IS NULL;

-- Make user_id NOT NULL
ALTER TABLE "agenda" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "goal" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "note" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "project" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "routine" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "time_log" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "project_member" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "member_role" NOT NULL DEFAULT 'EDITOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "member_role" NOT NULL DEFAULT 'EDITOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_member_project_id_user_id_key" ON "project_member"("project_id", "user_id");
CREATE UNIQUE INDEX "team_slug_key" ON "team"("slug");
CREATE UNIQUE INDEX "team_member_team_id_user_id_key" ON "team_member"("team_id", "user_id");

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "goal" ADD CONSTRAINT "goal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "note" ADD CONSTRAINT "note_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project" ADD CONSTRAINT "project_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "routine" ADD CONSTRAINT "routine_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "routine_task_log" ADD CONSTRAINT "routine_task_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_log" ADD CONSTRAINT "time_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
