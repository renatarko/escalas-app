"use client";

import { api } from "@/trpc/react";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { CardSchedule } from "./card-schedule";
import { CalendarDays, Grid } from "lucide-react";
import { useState } from "react";
import { CalendarView } from "./calendar-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "calendar" | "cards")}
        className="flex flex-col gap-6"
      >
        <TabsList className="bg-card flex h-12 self-center overflow-hidden p-1 shadow-sm">
          <TabsTrigger className="rounded-md" value="cards">
            <Grid size={16} />
            Cards
          </TabsTrigger>
          <TabsTrigger className="rounded-md" value="calendar">
            <CalendarDays size={16} />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="grid w-full gap-4 md:grid-cols-2">
          {data &&
            data.length > 0 &&
            data?.map((schedule) => {
              return <CardSchedule key={schedule.id} schedule={schedule} />;
            })}
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView schedules={schedules} />
        </TabsContent>
      </Tabs>

      {(isPending || isLoading) && (
        <div className="bg-muted col-span-full h-20 w-full animate-pulse rounded-lg border p-8"></div>
      )}

      {data?.length === 0 && (!isPending || !isLoading) && (
        <p className="text-muted-foreground col-span-full pb-4 text-center">
          Não há escalas, crie agora sua primeira escala
        </p>
      )}
    </div>
  );
};
