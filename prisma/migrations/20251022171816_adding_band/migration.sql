/*
  Warnings:

  - Added the required column `band_id` to the `recurrence_configs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BandRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED', 'DECLINED');

-- AlterTable
ALTER TABLE "recurrence_configs" ADD COLUMN     "band_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "band_id" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "whatsapp" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "created_by_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band_members" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "BandRole" NOT NULL DEFAULT 'MEMBER',
    "instruments" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "band_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "band_invitations" (
    "id" TEXT NOT NULL,
    "band_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "instruments" TEXT[],
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "band_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "band_members_band_id_idx" ON "band_members"("band_id");

-- CreateIndex
CREATE INDEX "band_members_user_id_idx" ON "band_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_members_band_id_user_id_key" ON "band_members"("band_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "band_invitations_token_key" ON "band_invitations"("token");

-- CreateIndex
CREATE INDEX "band_invitations_email_idx" ON "band_invitations"("email");

-- CreateIndex
CREATE INDEX "band_invitations_token_idx" ON "band_invitations"("token");

-- CreateIndex
CREATE INDEX "band_invitations_band_id_idx" ON "band_invitations"("band_id");

-- CreateIndex
CREATE INDEX "recurrence_configs_band_id_idx" ON "recurrence_configs"("band_id");

-- CreateIndex
CREATE INDEX "schedules_band_id_idx" ON "schedules"("band_id");

-- AddForeignKey
ALTER TABLE "bands" ADD CONSTRAINT "bands_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_members" ADD CONSTRAINT "band_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_invitations" ADD CONSTRAINT "band_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_invitations" ADD CONSTRAINT "band_invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "band_invitations" ADD CONSTRAINT "band_invitations_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurrence_configs" ADD CONSTRAINT "recurrence_configs_band_id_fkey" FOREIGN KEY ("band_id") REFERENCES "bands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
