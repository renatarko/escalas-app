"use client";

import { CalendarDays, Download, Grid } from "lucide-react";
import { api } from "@/trpc/react";
import { useCurrentMember } from "@/lib/hooks/members";
import { CalendarView } from "./calendar-view";
import { useState } from "react";
import { CardOwnSchedule } from "./card-own-schedule";
import { Button } from "./ui/button";
import { exportToCalendar } from "@/lib/utils/export-calendar";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const ListScheduleParticipant = () => {
  const member = useCurrentMember();
  const { bandName } = useFindCurrentBandId();

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

  const handleExport = () => {
    if (!data) {
      alert("Não há eventos para exportar");
      return;
    }

    const schedules = data.map(({ schedule, scheduleId, participant }) => ({
      id: scheduleId,
      status: schedule.status,
      title: schedule.name ?? "",
      name: schedule.name ?? "",
      date: schedule.date ?? new Date(),
      time: schedule.time ?? undefined,
      recurrenceType: schedule.recurrenceType,
      createdBy: {
        name: schedule.createdBy?.name ?? "",
        email: schedule.createdBy?.email ?? undefined,
      },
      participants: [
        {
          participant: {
            name: participant.name ?? "",
            email: participant.email ?? undefined,
          },
        },
      ],
      recurrenceGroupId: schedule.recurrenceGroupId ?? undefined,
      recurrenceConfig: schedule.recurrenceConfig ?? undefined,
    }));

    exportToCalendar(schedules, `minhas-escalas-${bandName}.ics`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "calendar" | "cards")}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-card h-12 overflow-hidden p-1 shadow-sm">
            <TabsTrigger className="rounded-md" value="cards">
              <Grid size={16} />
              Cards
            </TabsTrigger>
            <TabsTrigger className="rounded-md" value="calendar">
              <CalendarDays size={16} />
              Calendário
            </TabsTrigger>
          </TabsList>
          {viewMode === "calendar" && data && data.length > 0 && (
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2"
              disabled={!data || data.length === 0}
            >
              <Download className="h-4 w-4" />
              Exportar Calendário
            </Button>
          )}
        </div>

        <TabsContent value="cards" className="grid w-full gap-4 md:grid-cols-2">
          {data &&
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
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView
            isAllSchedules={false}
            schedules={data.map(
              ({
                schedule,
                scheduleId,
                participant,
                instrument,
                confirmed,
              }) => ({
                ...schedule,
                status: schedule.status,
                name: schedule.name,
                start: schedule.date,
                id: scheduleId,
                end: schedule.date,
                title: schedule.name,
                participants: [{ ...participant, instrument, confirmed }],
              }),
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
