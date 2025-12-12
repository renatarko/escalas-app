import { db } from "@/server/db";
import { inngest } from "../client";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const cleanupOldNotificationLogs = inngest.createFunction(
  {
    id: "cleanup-old-notification-logs",
    name: "Cleanup Notification Logs older than 30 days",
    retries: 2,
  },
  // Executa diariamente às 04:30
  { cron: "30 4 * * *" },
  async ({ step }) => {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);

    const deleted = await step.run("delete-old-logs", async () => {
      return db.notificationLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
    });

    return {
      cutoff: cutoff.toISOString(),
      deleted: deleted.count,
    };
  },
);
