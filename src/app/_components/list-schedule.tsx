"use client";

import {
  Calendar as DateRangeIcon,
  CalendarDays,
  Grid,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CalendarView } from "./calendar-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getMonthRange } from "@/lib/utils/getMonthRange";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Input } from "./ui/input";
import type { Schedule as ScheduleType } from "@/lib/types";
import { ScheduleCard } from "./schedule/schedule-card";
import { Calendar } from "./ui/calendar";
import { useSchedules, type ScheduleHook } from "@/hooks/use-schedule";
import { useSendWhatsAppConfirmations } from "@/hooks/use-whatsapp-notification";
import { Spinner } from "./ui/spinner";

export const ListSchedule = () => {
  const { start, end } = getMonthRange();

  const [search, setSearch] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(
    null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem("scheduleViewMode");
    return saved ?? "cards";
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [draftRange, setDraftRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [openFilter, setOpenFilter] = useState(false);

  const { data, isLoading } = useSchedules({
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  const sendConfirmations = useSendWhatsAppConfirmations();

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

  const transformSchedule = (schedule: ScheduleHook): ScheduleType => ({
    id: schedule.id,
    title: schedule.name ?? "",
    date: new Date(schedule.date),
    notes: schedule.notes ?? undefined,
    createdAt: new Date(schedule.createdAt),
    updatedAt: new Date(schedule.updatedAt),
    participants: (schedule.participants ?? []).map((participant) => ({
      id: participant.id,
      scheduleId: schedule.id,
      participantId: participant.id,
      confirmed: participant.confirmed,
      confirmationMessageId: undefined,
      responseMessage: undefined,
      respondedAt: undefined,
      participant: {
        id: participant.id,
        name: participant.name ?? "",
        whatsapp: participant.whatsapp ?? "",
        instrument: participant.instrument ?? undefined,
        avatar: undefined,
        createdAt: new Date(),
      },
    })),
  });

  const transformedSchedules = (schedules || []).map(transformSchedule);

  const filteredSchedules = transformedSchedules?.filter(
    (schedule) =>
      schedule.title.toLowerCase().includes(search.toLowerCase()) ||
      schedule.location?.toLowerCase().includes(search.toLowerCase()),
  );

  const upcomingSchedules = filteredSchedules
    .filter((s) => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastSchedules = filteredSchedules
    .filter((s) => new Date(s.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSendConfirmations = async (scheduleId: string) => {
    await sendConfirmations.mutateAsync({ scheduleId });
  };

  const selectedLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "P", { locale: ptBR })} - ${format(dateRange.to, "P", { locale: ptBR })}`
      : "Selecione um período";

  return (
    <div className="flex flex-col gap-6">
      <div className="relative sm:max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar escalas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-14 pl-10"
        />
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "calendar" | "cards")}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row-reverse sm:gap-2">
          <div className="flex w-full flex-col justify-end gap-2 sm:flex-row sm:items-center">
            <Popover open={openFilter} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 w-full justify-start gap-2 text-left font-normal sm:w-fit"
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
              variant="secondary"
              size="sm"
              className="text-muted-foreground"
              onClick={handleResetRange}
              disabled={
                dateRange?.from?.toDateString() === start.toDateString() &&
                dateRange?.to?.toDateString() === end.toDateString()
              }
            >
              <span className="cursor-pointer text-sm"> Limpar período</span>
            </Button>
          </div>

          <TabsList className="bg-card flex h-14 w-full self-center overflow-hidden border p-1 shadow-none sm:w-28">
            <TabsTrigger
              className="text-md data-[state=active]:bg-primary rounded-md py-3"
              value="cards"
            >
              <Grid className="size-6 sm:size-4" />
            </TabsTrigger>
            <TabsTrigger className="text-md rounded-md py-3" value="calendar">
              <CalendarDays className="size-6 sm:size-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cards" className="space-y-4">
          {/* Upcoming Schedules */}
          <section className="space-y-4">
            <h2 className="font-display text-foreground flex items-center gap-2 text-lg font-semibold">
              <DateRangeIcon className="text-primary h-5 w-5" />
              Próximas Escalas
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                ({upcomingSchedules.length})
              </span>
            </h2>

            {!isLoading && upcomingSchedules.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {upcomingSchedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onSendConfirmations={() =>
                        handleSendConfirmations(schedule.id)
                      }
                      isSending={sendConfirmations.isPending}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border-border rounded-xl border py-12 text-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Spinner className="size-8" />
                    <h3 className="text-muted-foreground mb-1 font-medium">
                      Buscando escalas...
                    </h3>
                  </div>
                ) : (
                  <>
                    <DateRangeIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <h3 className="text-foreground mb-1 font-medium">
                      Nenhuma escala encontrada
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {search
                        ? "Tente uma busca diferente"
                        : "Crie uma nova escala para começar"}
                    </p>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Past Schedules */}
          {pastSchedules.length > 0 && (
            <section className="w-full space-y-4">
              <h2 className="font-display text-muted-foreground text-lg font-semibold">
                Escalas Anteriores
                <span className="ml-2 text-sm font-normal">
                  ({pastSchedules.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {pastSchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            </section>
          )}
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView schedules={schedules} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
