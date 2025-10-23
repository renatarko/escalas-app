/*
  Warnings:

  - Added the required column `nickname` to the `bands` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bands" ADD COLUMN     "nickname" TEXT NOT NULL;
