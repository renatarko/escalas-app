import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import {
  helloWorld,
  sendScheduleNotification,
  sendScheduleReminder,
  scheduledReminders,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    sendScheduleNotification,
    sendScheduleReminder,
    scheduledReminders,
  ],
});
