-- AlterTable
ALTER TABLE "recurrence_configs" ALTER COLUMN "time" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schedules" ALTER COLUMN "time" DROP NOT NULL;
