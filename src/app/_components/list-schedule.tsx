"use client";

import {
  Calendar,
  Check,
  EllipsisVertical,
  Pencil,
  Send,
  Trash,
} from "lucide-react";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { Badge } from "./ui/badge";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { AlertCustom } from "./custom-alert";
import { useState } from "react";

type MenuOptionsProps = {
  scheduleId: string;
};

const MenuOptions = ({ scheduleId }: MenuOptionsProps) => {
  const [modals, setModals] = useState({ delete: false });
  const utils = api.useUtils().schedule.list;

  const { mutateAsync: deleteSchedule, isPending } =
    api.schedule.delete.useMutation({
      onSuccess: async () => {
        await utils.invalidate();
      },
    });

  const handleDelete = async () => {
    console.log({ scheduleId });
    try {
      await deleteSchedule({ id: scheduleId });
      toast.success("Escala excluída com sucesso");
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível excluir a escala");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline">
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <Pencil />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Check />
            Confirmar
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Send />
            Notificar
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            variant="destructive"
            onClick={() => setModals({ delete: true })}
          >
            <Trash />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertCustom
        open={modals.delete}
        setOpen={(value) => setModals({ delete: value })}
        handleConfirm={handleDelete}
        disabled={isPending}
      />
    </>
  );
};

export const ListSchedule = () => {
  const { bandId, isLoading } = useFindCurrentBandId();
  const { data, isPending } = api.schedule.list.useQuery(
    { bandId: bandId ?? "" },
    { enabled: !!bandId },
  );

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {isPending ||
        (isLoading && (
          <div className="bg-card h-20 w-20 animate-ping p-8"></div>
        ))}

      {!data && (!isPending || !isLoading) && (
        <p className="col-span-full font-semibold">
          Não há escalas, crie agora sua primeira escala
        </p>
      )}

      {data &&
        data.length > 0 &&
        data?.map((schedule) => {
          return (
            <div
              key={schedule.id}
              className="bg-card border-input min-h-60 space-y-6 rounded-lg border p-4"
            >
              <div className="flex w-full items-start justify-between">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{schedule.name}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="size-4" />{" "}
                    {schedule.date.toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <Badge
                    variant="secondary"
                    className={`${schedule.recurrenceType === "SINGLE" ? "bg-cyan-500/40" : "bg-purple-500/40"}`}
                  >
                    {schedule.recurrenceType === "SINGLE"
                      ? "único"
                      : "recorrente"}
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
                  <MenuOptions scheduleId={schedule.id} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {schedule.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                          {
                            SetInstrument(participant.instrument as Instrument)
                              .icon
                          }
                        </TooltipTrigger>
                        <TooltipContent>
                          {
                            SetInstrument(participant.instrument as Instrument)
                              .label
                          }
                        </TooltipContent>
                      </Tooltip>
                      <div className="">
                        <p>{participant.participant.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {participant.participant.whatsapp}
                        </p>
                      </div>
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
                      <Button variant="outline" size="icon-sm">
                        <Send className="size-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* <Accordion type="single">
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
              </Accordion> */}
            </div>
          );
        })}
    </div>
  );
};
