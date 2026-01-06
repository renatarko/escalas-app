"use client";

import { api } from "@/trpc/react";

export function useNotificationLogs(scheduleId?: string) {
  const logs = api.notificationLog.listBySchedule.useQuery(
    { scheduleId: scheduleId ?? undefined, limit: 25 },
    // { enabled: !!scheduleId && !!scheduleId },
  );

  const data = logs.data?.map((log) => ({
    id: log.id,
    status: log.status,
    type: log.type,
    message: log.message,
    error: log.error,
    createdAt: log.createdAt,
    participant: log.scheduleParticipant?.participant.name,
    schedule: log.scheduleParticipant?.schedule.name,
  }));

  return {
    ...logs,
    data,
  };
}
