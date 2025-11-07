"use client";

import { Calendar } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import { api } from "@/trpc/react";
import { useCurrentMember } from "@/lib/hooks/members";

export const ListScheduleParticipant = () => {
  const member = useCurrentMember();

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {data?.map(({ schedule, confirmed, instrument, justification }) => (
        <div
          key={schedule.id}
          className="bg-card border-input space-y-6 rounded-lg border p-4"
        >
          <div className="flex w-full flex-col-reverse gap-2 sm:items-start md:flex-row md:justify-between">
            <div className="space-y-2">
              <p className="text-lg font-semibold">{schedule.name}</p>
              <p className="flex items-center gap-1">
                <Calendar className="size-4" />{" "}
                {schedule.date.toLocaleDateString()}
              </p>
            </div>

            <div className="flex w-full items-center justify-end space-x-2 sm:space-x-4">
              <Badge
                variant="secondary"
                className={`${schedule.recurrenceType === "SINGLE" ? "bg-cyan-500/40" : "bg-purple-500/40"}`}
              >
                {schedule.recurrenceType === "SINGLE" ? "único" : "recorrente"}
              </Badge>

              <div className="flex flex-col items-end">
                <Tooltip>
                  <TooltipTrigger>
                    <p className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold uppercase">
                      {schedule.createdBy.name?.slice(0, 2)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Criador da escala:</p>
                    {schedule.createdBy.name}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Função</p>
              <p className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                {SetInstrument(instrument as Instrument).icon}
                <span className="ml-2">
                  {SetInstrument(instrument as Instrument).label}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Justificativa</p>
              <p className="p-2">{justification ?? "-"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Confirmação</p>
              <Badge
                variant="secondary"
                className={`p-2 ${confirmed === false && "bg-destructive/50"} ${confirmed === null && "bg-chart-5/50"} ${confirmed && "bg-green-500/50"}`}
              >
                {confirmed && "Confirmado"}
                {confirmed === false && "Rejeitado"}
                {confirmed === null && "Pendente"}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
