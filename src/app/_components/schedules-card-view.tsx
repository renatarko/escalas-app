"use client";

import { cn } from "@/lib/utils";
import type { RecurrenceType, ScheduleStatus } from "@prisma/client";
import { CardSchedule } from "./card-schedule";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useTabsStore } from "@/stores/use-tabs-store";

type Participant = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  instrument: string;
  confirmed: boolean | null;
  notified: boolean | null;
  justification: string | null;
};

type ScheduleCard = {
  id: string;
  status: ScheduleStatus;
  name: string | null;
  date: Date;
  recurrenceType: RecurrenceType;
  createdBy: { name: string | null };
  participants: Participant[];
};

type SchedulesCardViewProps = {
  schedules?: ScheduleCard[];
  isLoading?: boolean;
  isFiltered?: boolean;
  className?: string;
};

export const SchedulesCardView = ({
  schedules,
  isLoading,
  isFiltered,
  className,
}: SchedulesCardViewProps) => {
  const { setTab } = useTabsStore();

  const goToCreateSchedule = () => {
    setTab("create-scales");
  };

  if (isLoading) {
    return (
      <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index + 1}
            className="bg-muted/50 h-48 w-full animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-muted-foreground">
          {isFiltered
            ? "Não há escalas para o período selecionado"
            : "Não há escalas, crie agora sua primeira escala"}
        </p>

        {!isFiltered && (
          <Button onClick={goToCreateSchedule} size="sm">
            Criar Escala
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid w-full gap-4 md:grid-cols-2", className)}>
      {schedules.map((schedule) => (
        <CardSchedule
          isOwnSchedule={false}
          key={schedule.id}
          schedule={schedule}
        />
      ))}
    </div>
  );
};
