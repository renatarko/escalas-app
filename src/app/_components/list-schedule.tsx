"use client";

import { api } from "@/trpc/react";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { Calendar as DateRangeIcon, CalendarDays, Grid } from "lucide-react";
import { useEffect, useState } from "react";
import { CalendarView } from "./calendar-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getMonthRange } from "@/lib/utils/getMonthRange";
import { SchedulesCardView } from "./schedules-card-view";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

export const ListSchedule = () => {
  const { start, end } = getMonthRange();

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("scheduleViewMode");
    return saved ?? "cards";
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    from: start,
    to: end,
  });
  const [draftRange, setDraftRange] = useState<DateRange>({
    from: start,
    to: end,
  });
  const [openFilter, setOpenFilter] = useState(false);

  const { bandId, isLoading } = useFindCurrentBandId();
  const { data, isPending } = api.schedule.list.useQuery(
    {
      bandId: bandId ?? "",
      startDate: dateRange?.from,
      endDate: dateRange?.to,
    },
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

  useEffect(() => {
    localStorage.setItem("scheduleViewMode", viewMode);
  }, [viewMode]);

  const handleResetRange = () => {
    setDateRange({ from: start, to: end });
    setDraftRange({ from: start, to: end });
  };

  const handleApplyRange = () => {
    if (draftRange?.from && draftRange?.to) {
      setDateRange(draftRange);
      setOpenFilter(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpenFilter(open);
    if (open) {
      setDraftRange(dateRange);
    }
  };

  const selectedLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "P", { locale: ptBR })} - ${format(dateRange.to, "P", { locale: ptBR })}`
      : "Selecione um período";

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

        <TabsContent value="cards" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Popover open={openFilter} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-left font-normal sm:w-fit"
                >
                  <DateRangeIcon className="h-4 w-4" />
                  <span className="truncate">{selectedLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto" align="start">
                <div className="space-y-2 p-3">
                  <Calendar
                    mode="range"
                    locale={ptBR}
                    defaultMonth={draftRange?.from}
                    selected={draftRange}
                    onSelect={(range) =>
                      setDraftRange(range ?? { from: start, to: end })
                    }
                    numberOfMonths={1}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={!draftRange?.from || !draftRange?.to}
                      onClick={handleApplyRange}
                    >
                      Filtrar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={handleResetRange}
              disabled={
                dateRange?.from?.toDateString() === start.toDateString() &&
                dateRange?.to?.toDateString() === end.toDateString()
              }
            >
              Limpar período
            </Button>
          </div>
          <SchedulesCardView
            isFiltered={!!dateRange}
            schedules={data}
            isLoading={isPending}
          />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView schedules={schedules} />
        </TabsContent>
      </Tabs>

      {(isPending || isLoading) && (
        <div className="bg-muted col-span-full h-20 w-full animate-pulse rounded-lg border p-8"></div>
      )}
    </div>
  );
};
