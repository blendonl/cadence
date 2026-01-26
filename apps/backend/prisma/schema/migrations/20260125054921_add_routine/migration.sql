-- CreateEnum
CREATE TYPE "alarm_plan_status" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "alarm_plan_type" AS ENUM ('WAKE', 'SLEEP', 'STEP');

-- CreateEnum
CREATE TYPE "routine_status" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "routine_type" AS ENUM ('SLEEP', 'STEP', 'OTHER');

-- AlterTable
ALTER TABLE "agenda_item" ADD COLUMN     "routine_task_id" TEXT,
ALTER COLUMN "task_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "alarm_plan" (
    "id" TEXT NOT NULL,
    "routine_task_id" TEXT NOT NULL,
    "status" "alarm_plan_status" NOT NULL DEFAULT 'PENDING',
    "type" "alarm_plan_type" NOT NULL,
    "target_at" TIMESTAMP(3) NOT NULL,
    "repeat_interval_minutes" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alarm_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "routine_status" NOT NULL DEFAULT 'ACTIVE',
    "type" "routine_type" NOT NULL,
    "target" TEXT NOT NULL,
    "separate_into" INTEGER NOT NULL DEFAULT 1,
    "repeat_interval_minutes" INTEGER NOT NULL,
    "active_days" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_task" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_task_log" (
    "id" TEXT NOT NULL,
    "routine_task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_task_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alarm_plan_routine_task_id_target_at_idx" ON "alarm_plan"("routine_task_id", "target_at");

-- AddForeignKey
ALTER TABLE "agenda_item" ADD CONSTRAINT "agenda_item_routine_task_id_fkey" FOREIGN KEY ("routine_task_id") REFERENCES "routine_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alarm_plan" ADD CONSTRAINT "alarm_plan_routine_task_id_fkey" FOREIGN KEY ("routine_task_id") REFERENCES "routine_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_task" ADD CONSTRAINT "routine_task_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_task_log" ADD CONSTRAINT "routine_task_log_routine_task_id_fkey" FOREIGN KEY ("routine_task_id") REFERENCES "routine_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
