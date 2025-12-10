"use client";

import {
  Calendar,
  CalendarSync,
  Check,
  ChevronDown,
  Dot,
  EllipsisVertical,
  Pencil,
  Send,
  Trash,
  Users2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { AlertCustom } from "./custom-alert";
import { useMemo, useState } from "react";
import type { RecurrenceType, ScheduleStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { CardMemberSchedule } from "./card-member-schedule";

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

  const [modals, setModals] = useState({ delete: false, notifyAll: false });

  const utils = api.useUtils().schedule.list;

  const { mutateAsync: deleteSchedule, isPending } =
    api.schedule.delete.useMutation({
      onSuccess: async () => {
        await utils.invalidate();
      },
    });

  const { mutateAsync: sendNotification, isPending: isSendingNotification } =
    api.whatsapp.sendScheduleNotification.useMutation();

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

  const handleNotifyAll = async () => {
    try {
      await sendNotification({ scheduleId: schedule.id, type: "notification" });
      toast.success("Integrantes notificados com sucesso");
    } catch (error) {
      console.log(error);
      toast.error("Ops, houve um erro ao enviar as notificações");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={`hover:bg-muted/10 rounded-md bg-transparent p-2 duration-150`}
        >
          <EllipsisVertical className="size-4" />
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
          <DropdownMenuItem
            disabled={isSendingNotification}
            onClick={() => setModals({ ...modals, notifyAll: true })}
          >
            <Send />
            Notificar Integrantes
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            variant="destructive"
            onClick={() => setModals({ ...modals, delete: true })}
          >
            <Trash />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertCustom
        open={modals.delete}
        setOpen={(value) => setModals({ ...modals, delete: value })}
        handleConfirm={handleDelete}
        disabled={isPending}
      />
      <AlertCustom
        open={modals.notifyAll}
        setOpen={(value) => setModals({ ...modals, notifyAll: value })}
        handleConfirm={handleNotifyAll}
        disabled={isSendingNotification}
        loading={isSendingNotification}
        title="Enviar notificações?"
        description={
          "Essa ação enviará uma mensagem via WhatsApp para todos os integrantes desta escala. Deseja continuar?"
        }
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
  notified: boolean | null;
  justification: string | null;
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
  isOwnSchedule: boolean;
};

export const CardSchedule = ({ schedule }: CardListScheduleProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const confirmedStatus = useMemo(() => {
    const members = schedule.participants;
    const confirmed = members.filter((m) => m.confirmed).length;
    const total = members.length;
    return { confirmed, total, pending: total - confirmed };
  }, [schedule]);

  const isExpanded = expandedCard === schedule.id;

  return (
    <Card className="p-0">
      <CardHeader className="bg-primary text-primary-foreground gap-4 rounded-t-lg p-4">
        <div className="flex w-full items-center justify-between">
          <Badge
            variant="secondary"
            className={`text-white ${schedule.recurrenceType === "SINGLE" ? "bg-cyan-500" : "bg-indigo-500"}`}
          >
            {schedule.recurrenceType === "SINGLE" ? "único" : "recorrente"}
          </Badge>
          <MenuOptions schedule={schedule} />
        </div>

        <CardTitle>{schedule.name}</CardTitle>
        <CardDescription className="text-muted text-md flex flex-wrap gap-2 font-light sm:items-center sm:gap-4">
          <span className="flex items-center gap-2">
            <Calendar className="size-4" />
            {schedule.date.toLocaleDateString()}
          </span>
          <span className="flex items-center gap-2">
            <Users2 className="size-4" />
            <b>{confirmedStatus.total}</b>
            {confirmedStatus.total > 1 ? "Integrantes" : "Integrante"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
          <p className="text-muted-foreground text-xs">
            Criado por {schedule.createdBy.name}
          </p>

          <div className="flex items-center gap-4">
            <p className="flex items-center text-xs">
              <Dot className="size-6 text-red-500" />
              {confirmedStatus.pending} Pendentes
            </p>
            <p className="flex items-center text-xs">
              <Dot className="size-6 text-green-500" />
              {confirmedStatus.confirmed} Confirmados
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <button
            onClick={() => toggleCard(schedule.id)}
            className="text-muted-foreground hover:text-primary flex w-full items-center justify-between text-sm font-medium transition-colors"
          >
            <span className="text-xs">Integrantes da Escala</span>
            <ChevronDown
              className={`transform transition-transform ${expandedCard ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`space-y-2 ${expandedCard === schedule.id ? "" : "max-h-64 overflow-hidden"}`}
          >
            {schedule.participants.map((member) => {
              return (
                <CardMemberSchedule
                  {...member}
                  key={member.id}
                  scheduleId={schedule.id}
                />
              );
            })}
          </div>
        </div>

        {!isExpanded && schedule.participants.length > 3 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setExpandedCard(schedule.id)}
              className="text-primary hover:text-primary/70 text-sm font-medium"
            >
              Ver todos os {schedule.participants.length} integrantes
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
