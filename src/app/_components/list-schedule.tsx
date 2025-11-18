"use client";

import { api } from "@/trpc/react";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { CardSchedule } from "./card-schedule";
import { CalendarDays, Grid } from "lucide-react";
import { useState } from "react";
import { CalendarView } from "./calendar-view";

export const ListSchedule = () => {
  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");

  const { bandId, isLoading } = useFindCurrentBandId();
  const { data, isPending } = api.schedule.list.useQuery(
    { bandId: bandId ?? "" },
    { enabled: !!bandId },
  );

  const schedules = data
    ? data.map((schedule) => {
        return {
          title: schedule.name,
          name: schedule.name,
          start: schedule.date,
          end: schedule.date,
          date: schedule.date,
          status: schedule.status,
          recurrenceType: schedule.recurrenceType,
          id: schedule.id,
          participants: schedule.participants,
          createdBy: schedule.createdBy,
        };
      })
    : [];

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

      {(isPending || isLoading) && (
        <div className="bg-muted col-span-full h-20 w-full animate-pulse rounded-lg border p-8"></div>
      )}

      {data?.length === 0 && (!isPending || !isLoading) && (
        <p className="text-muted-foreground col-span-full pb-4 text-center">
          Não há escalas, crie agora sua primeira escala
        </p>
      )}

      {viewMode === "calendar" && data && (
        <CalendarView schedules={schedules} />
      )}

      <div className="grid w-full gap-4 md:grid-cols-2">
        {viewMode === "cards" &&
          data &&
          data.length > 0 &&
          data?.map((schedule) => {
            return <CardSchedule key={schedule.id} schedule={schedule} />;
          })}
      </div>
    </div>
  );
};
