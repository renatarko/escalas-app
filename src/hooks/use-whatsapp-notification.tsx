import { api } from "@/trpc/react";
import { toast } from "sonner";

interface SendConfirmationResult {
  success: boolean;
  results: Array<{
    participantId: string;
    success: boolean;
    messageId?: string;
    error?: string;
  }>;
  summary: {
    sent: number;
    failed: number;
  };
}

export function useSendWhatsAppConfirmation() {
  const utils = api.useUtils();

  return api.whatsapp.sendParticipantNotification.useMutation({
    onSuccess: async () => {
      toast("Integrante nofiticado com sucesso!");
      await utils.schedule.list.invalidate();
    },
    onError: () => {
      toast.error("Erro ao enviar notificação");
    },
  });
}

export function useSendWhatsAppConfirmations() {
  const utils = api.useUtils();

  return api.whatsapp.sendScheduleNotification.useMutation({
    onSuccess: async () => {
      toast("Integrantes notificados com sucesso!");
      await utils.schedule.list.invalidate();
    },
    onError: () => {
      toast.error("Erro ao enviar notificações");
    },
  });
}
