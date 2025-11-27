"use client";

import {
  Calendar,
  CalendarSync,
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
import type { RecurrenceType, ScheduleStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";

type MenuOptionsProps = {
  schedule: {
    id: string;
    status: ScheduleStatus;
    recurrenceType: RecurrenceType;
  };
};

const MenuOptions = ({ schedule }: MenuOptionsProps) => {
  const { id } = schedule;

  const router = useRouter();

  const [modals, setModals] = useState({ delete: false });

  const utils = api.useUtils().schedule.list;

  const { mutateAsync: deleteSchedule, isPending } =
    api.schedule.delete.useMutation({
      onSuccess: async () => {
        await utils.invalidate();
      },
    });

  const handleDelete = async () => {
    try {
      await deleteSchedule({ id });
      toast.success("Escala excluída com sucesso");
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível excluir a escala");
    }
  };

  const handleEdit = () => {
    router.push(`/admin/schedule/${schedule.id}`);
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
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil />
            Editar Escala
          </DropdownMenuItem>
          {schedule.recurrenceType === "RECURRING" && (
            <DropdownMenuItem>
              <CalendarSync />
              Editar recorrência
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled>
            <Check />
            Confirmar
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
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

type Participant = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  instrument: string;
  confirmed: boolean | null;
};

type CardListScheduleProps = {
  schedule: {
    id: string;
    status: ScheduleStatus;
    name: string | null;
    date: Date;
    recurrenceType: RecurrenceType;
    createdBy: { name: string | null };
    participants: Participant[];
  };
};

export const CardSchedule = ({ schedule }: CardListScheduleProps) => {
  const { membership } = getCurrentMembership();
  const isUserAdmin = isAdmin(membership);

  return (
    <div
      key={schedule.id}
      className="bg-card border-input min-h-60 space-y-6 rounded-lg border p-4"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-lg font-semibold">{schedule.name}</p>
          <p className="flex items-center gap-1">
            <Calendar className="size-4" /> {schedule.date.toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2 sm:space-x-4">
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

          {isUserAdmin && <MenuOptions schedule={schedule} />}
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
                  {SetInstrument(participant.instrument as Instrument).icon}
                </TooltipTrigger>
                <TooltipContent>
                  {SetInstrument(participant.instrument as Instrument).label}
                </TooltipContent>
              </Tooltip>
              <div className="">
                <p>{participant.name}</p>
                <p className="text-muted-foreground text-xs">
                  {participant.whatsapp}
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

              {isUserAdmin && !participant.confirmed && (
                <Button variant="outline" size="icon-sm">
                  <Send className="size-4 text-green-600" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
