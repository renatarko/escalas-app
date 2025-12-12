"use client";

import { api } from "@/trpc/react";

export function useNotificationLogs(scheduleId?: string) {
  return api.notificationLog.listBySchedule.useQuery(
    { scheduleId: scheduleId ?? undefined, limit: 25 },
    // { enabled: !!scheduleId && !!scheduleId },
  );
}
