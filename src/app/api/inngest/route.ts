import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  sendScheduleReminder,
  sendNotificationN8N,
  sendBatchNotificationN8N,
  expireAwaitingPendingConfirmations,
  cleanupOldNotificationLogs,
  scheduledRemindersCron,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendScheduleReminder,
    sendNotificationN8N,
    sendBatchNotificationN8N,
    scheduledRemindersCron,
    expireAwaitingPendingConfirmations,
    cleanupOldNotificationLogs,
    // cleanupExpiredOrCompletedPendingConfirmations,
  ],
});
