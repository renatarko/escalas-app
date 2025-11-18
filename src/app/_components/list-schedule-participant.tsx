"use client";

import { CalendarDays, Grid } from "lucide-react";
import { api } from "@/trpc/react";
import { useCurrentMember } from "@/lib/hooks/members";
import { CalendarView } from "./calendar-view";
import { useState } from "react";
import { CardOwnSchedule } from "./card-own-schedule";

export const ListScheduleParticipant = () => {
  const member = useCurrentMember();

  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");

  const { data, isPending } = api.schedule.listByMemberId.useQuery(
    { memberId: member?.id ?? "" },
    { enabled: !!member },
  );

  if (isPending) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i + 1}
            className="bg-muted/50 h-44 w-full animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-muted-foreground text-center">
        Você não está em nenhum Escala
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card flex gap-2 self-center rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setViewMode("cards")}
          className={`flex items-center gap-2 rounded-sm px-4 py-2 transition-colors ${
            viewMode === "cards"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:bg-gray-100"
          }`}
        >
          <Grid size={18} />
          Cards
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors ${
            viewMode === "calendar"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:bg-gray-100"
          }`}
        >
          <CalendarDays size={18} />
          Calendário
        </button>
      </div>

      {viewMode === "calendar" && data && (
        <CalendarView
          isAllSchedules={false}
          schedules={data.map(
            ({ schedule, scheduleId, participant, instrument, confirmed }) => ({
              ...schedule,
              status: "PENDING",
              name: schedule.name,
              start: schedule.date,
              id: scheduleId,
              end: schedule.date,
              title: schedule.name,
              participants: [{ ...participant, instrument, confirmed }],
            }),
          )}
        />
      )}

      <div className="grid w-full gap-4 md:grid-cols-2">
        {viewMode === "cards" &&
          data &&
          data.length > 0 &&
          data?.map(({ schedule, instrument, justification, confirmed }) => {
            return (
              <CardOwnSchedule
                key={schedule.id}
                schedule={{
                  ...schedule,
                  participant: { instrument, justification, confirmed },
                }}
              />
            );
          })}
      </div>
    </div>
  );
};
