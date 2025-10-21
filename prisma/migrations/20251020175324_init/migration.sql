/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('SINGLE', 'RECURRING');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "whatsapp" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "recurrence_type" "RecurrenceType" NOT NULL DEFAULT 'SINGLE',
    "recurrence_group_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_configs" (
    "id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "day_of_week" INTEGER,
    "week_of_month" INTEGER,
    "time" TIME NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurrence_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurrence_participants" (
    "id" TEXT NOT NULL,
    "recurrence_config_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurrence_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_participants" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "confirmed" BOOLEAN,
    "justification" TEXT,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "schedules_date_idx" ON "schedules"("date");

-- CreateIndex
CREATE INDEX "schedules_recurrence_group_id_idx" ON "schedules"("recurrence_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "recurrence_participants_recurrence_config_id_participant_id_key" ON "recurrence_participants"("recurrence_config_id", "participant_id");

-- CreateIndex
CREATE INDEX "schedule_participants_schedule_id_idx" ON "schedule_participants"("schedule_id");

-- CreateIndex
CREATE INDEX "schedule_participants_participant_id_idx" ON "schedule_participants"("participant_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_participants_schedule_id_participant_id_key" ON "schedule_participants"("schedule_id", "participant_id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_recurrence_group_id_fkey" FOREIGN KEY ("recurrence_group_id") REFERENCES "recurrence_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_configs" ADD CONSTRAINT "recurrence_configs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_participants" ADD CONSTRAINT "recurrence_participants_recurrence_config_id_fkey" FOREIGN KEY ("recurrence_config_id") REFERENCES "recurrence_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_participants" ADD CONSTRAINT "recurrence_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_participants" ADD CONSTRAINT "schedule_participants_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
