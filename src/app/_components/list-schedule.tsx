"use client";

import { Calendar, Send, Users } from "lucide-react";
import { Label } from "./ui/label";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { Badge } from "./ui/badge";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";

export const ListSchedule = () => {
  const { bandId, isLoading } = useFindCurrentBandId();
  const { data, isPending } = api.schedule.list.useQuery(
    { bandId: bandId ?? "" },
    { enabled: !!bandId },
  );

  return (
    <div className="mt-4 space-y-4">
      <h2 className="mb-6 text-2xl font-semibold">Minhas escalas</h2>

      {isPending ||
        (isLoading && <div className="bg-card h-14 animate-ping"></div>)}

      {!data && (!isPending || !isLoading) && (
        <p className="font-semibold">
          Não há escalas, crie agora sua primeira escala
        </p>
      )}

      {data &&
        data.length > 0 &&
        data?.map((schedule) => {
          return (
            <div
              key={schedule.id}
              className="bg-card border-input space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{schedule.name}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="size-4" />{" "}
                    {schedule.date.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <Badge
                    variant="secondary"
                    className={`${schedule.recurrenceType === "SINGLE" ? "bg-cyan-500/40" : "bg-purple-500/40"}`}
                  >
                    {schedule.recurrenceType === "SINGLE"
                      ? "único"
                      : "recorrente"}
                  </Badge>

                  <div className="flex flex-col items-end">
                    <Label className="text-muted-foreground text-xs">
                      Criador
                    </Label>
                    <p className="bg-muted flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold uppercase">
                      {schedule.createdBy.name?.slice(0, 2)}
                    </p>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="">
                    <div className="flex items-center gap-4">
                      <Users className="size-4" />
                      <p>Integrantes</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {schedule.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-6">
                          <div className="">
                            <p>{participant.participant.name}</p>
                            <p className="text-chart-2 text-xs">
                              {participant.participant.whatsapp}
                            </p>
                          </div>

                          <Tooltip>
                            <TooltipTrigger className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                              {
                                SetInstrument(
                                  participant.instrument as Instrument,
                                ).icon
                              }
                            </TooltipTrigger>
                            <TooltipContent>
                              {
                                SetInstrument(
                                  participant.instrument as Instrument,
                                ).label
                              }
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="space-x-2">
                          <Badge
                            variant="secondary"
                            className={`${participant.confirmed === false && "bg-destructive/50"} ${participant.confirmed === null && "bg-chart-5/50"} ${participant.confirmed && "bg-green-500/50"}`}
                          >
                            {participant.confirmed && "Confirmado"}
                            {participant.confirmed === false && "Rejeitado"}
                            {participant.confirmed === null && "Pendente"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Send className="size-4 text-green-600" /> Notificar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          );
        })}
    </div>
  );
};
