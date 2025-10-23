/*
  Warnings:

  - Made the column `band_id` on table `schedules` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "band_id" SET NOT NULL;
