"use client";

import type { Instrument } from "@/lib/types";
import { SetInstrument } from "@/lib/utils/setInstrument";
import { Badge } from "./ui/badge";
import { Check, Clock, MessageCircle, Send, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";

const ParticipantNotifyButton = ({
  scheduleId,
  participantId,
  hasWhatsapp,
}: {
  scheduleId: string;
  participantId: string;
  hasWhatsapp: boolean;
}) => {
  const { mutateAsync: sendNotification, isPending } =
    api.whatsapp.sendParticipantNotification.useMutation();

  const handleNotify = async () => {
    try {
      await sendNotification({ scheduleId, participantId });
      toast.success("Notificação enviada com sucesso");
    } catch (error) {
      console.log(error);
      toast.error("Erro ao enviar notificação");
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={handleNotify}
          disabled={isPending || !hasWhatsapp}
        >
          <Send className="size-4 text-green-600" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {hasWhatsapp
          ? "Enviar notificação via WhatsApp"
          : "WhatsApp não cadastrado"}
      </TooltipContent>
    </Tooltip>
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
  scheduleId: string;
};

export const CardMemberSchedule = ({
  id,
  confirmed,
  instrument,
  justification,
  name,
  notified,
  whatsapp,
  scheduleId,
}: Participant) => {
  const { membership } = getCurrentMembership();
  const isUserAdmin = isAdmin(membership);

  return (
    <div className="bg-muted/50 hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors">
      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl sm:flex">
        {SetInstrument(instrument as Instrument).icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <h3 className="font-medium">{name}</h3>
          {confirmed && (
            <Badge
              variant="secondary"
              className="w-fit shrink-0 items-center gap-1 rounded-full bg-green-100 p-1 text-xs font-medium text-green-700"
            >
              <Check size={12} />
              Confirmado
            </Badge>
          )}
          {confirmed === null && (
            <Badge
              variant="secondary"
              className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-amber-100 p-1 text-xs font-medium text-amber-700"
            >
              <Clock size={12} />
              Pendente
            </Badge>
          )}
          {!confirmed && confirmed !== null && (
            <Badge
              variant="secondary"
              className="flex w-fit shrink-0 items-center gap-1 rounded-full bg-red-100 p-1 text-xs font-medium text-red-700"
            >
              <X size={12} />
              Recusado
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground flex gap-2 text-xs">
          <span>
            {SetInstrument(instrument as Instrument).icon}
            <span className="ml-1">
              {SetInstrument(instrument as Instrument).label}
            </span>
          </span>
          <span>•</span>
          <span>{whatsapp}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {notified ? (
          <div className="rounded-lg bg-green-50 p-2" title="Notificado">
            <MessageCircle className="size-4 text-green-600" />
          </div>
        ) : (
          isUserAdmin && (
            <ParticipantNotifyButton
              scheduleId={scheduleId}
              hasWhatsapp={!!whatsapp}
              participantId={id}
              key={scheduleId}
            />
          )
        )}
      </div>
    </div>
  );
};
