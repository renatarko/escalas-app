import { format } from "date-fns";
import type { Instrument } from "../types";
import { SetInstrument } from "../utils/setInstrument";
import { evolutionAPI } from "./evolution-api";
import type {
  ScheduleNotificationPayload,
  WhatsAppNotificationResult,
} from "./types";
import { env } from "@/env";

type generateMessage = {
  participantName: string;
  bandName: string;
  scheduleName: string;
  date: string;
  instrument?: string;
  scheduleParticipantId?: string;
  pendingConfirmationId: string;
};

export const generateScheduleNotificationMessage = ({
  participantName,
  // bandName,
  scheduleName,
  date,
  instrument,
  scheduleParticipantId,
  pendingConfirmationId,
}: generateMessage): string => {
  const formattedDate = format(date, "dd/MM/yyyy");
  const instrumentText =
    SetInstrument(instrument as Instrument).label ??
    instrument ??
    "Instrumento não cadastrado";

  const confirmationInstructions =
    scheduleParticipantId &&
    `✅ Para confirmar sua presença, clique: 
${env.NEXT_PUBLIC_API_URL}/confirmation/${pendingConfirmationId}

_Aguardamos sua confirmação._`;

  return `Olá, ${participantName}! 👋

Você foi escalado(a) para escala *${scheduleName}*
🗓️ ${formattedDate}
🎸 ${instrumentText} \n
${confirmationInstructions}`;
};

class WhatsAppService {
  /**
   * Formata a data para exibição em português
   */
  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Formata a hora para exibição
   */
  private formatTime(timeStr?: string): string {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Gera mensagem de notificação de escala
   */
  generateScheduleNotificationMessage(
    participantName: string,
    bandName: string,
    scheduleName: string,
    date: string,
    time?: string,
    instrument?: string,
    scheduleParticipantId?: string,
  ): string {
    const formattedDate = this.formatDate(date);
    const formattedTime = time ? ` às ${this.formatTime(time)}` : "";
    const instrumentText =
      SetInstrument(instrument as Instrument).label ??
      instrument ??
      "Instrumento não cadastrado";

    const confirmationInstructions = scheduleParticipantId
      ? `\n\n*Para confirmar sua presença, responda:*
✅ *SIM* ou *CONFIRMO* ou *VOU*

❌ *Para recusar, responda:*
*NÃO* ou *NÃO VOU* ou *RECUSO*

_Responda esta mensagem com sua confirmação._`
      : `\n\nPor favor, confirme sua presença o mais breve possível.`;

    return `Olá, ${participantName}! 👋

Você foi escalado(a) para Escala: ${scheduleName} \n
 🗓️ ${formattedDate}${formattedTime} \n
 🎸 ${instrumentText}
 ${confirmationInstructions}`;
  }

  /**
   * Gera mensagem de lembrete de escala
   */
  generateScheduleReminderMessage(
    participantName: string,
    bandName: string,
    scheduleName: string,
    date: string,
    time?: string,
    instrument?: string,
  ): string {
    const formattedDate = this.formatDate(date);
    const formattedTime = time ? ` às ${this.formatTime(time)}` : "";
    const instrumentText =
      SetInstrument(instrument as Instrument).label ??
      instrument ??
      "Instrumento não cadastrado";

    return `⏰ *Lembrete*

Olá, ${participantName}! 👋

Não esqueça que você está escalado(a) para o dia *${formattedDate}* com a função *${instrumentText}* na Escala *${scheduleName}*

Nos vemos lá! 🙏`;
  }

  /**
   * Gera mensagem de cancelamento de escala
   */
  generateScheduleCancellationMessage(
    participantName: string,
    bandName: string,
    scheduleName: string,
    date: string,
  ): string {
    const formattedDate = this.formatDate(date);

    return `❌ *Escala Cancelada*

Olá, ${participantName}! 👋

A escala a seguir foi *cancelada*:

➡️ *Escala:* ${scheduleName} \n
🗓️ *Data:* ${formattedDate}

Entre em contato com o líder da banda para mais informações.`;
  }

  /**
   * Gera mensagem de alteração de escala
   */
  generateScheduleUpdateMessage(
    participantName: string,
    bandName: string,
    scheduleName: string,
    date: string,
    time?: string,
    changes?: string,
  ): string {
    const formattedDate = this.formatDate(date);
    const formattedTime = time ? ` às ${this.formatTime(time)}` : "";
    const changesText = changes ? `\n\n📝 *Alterações:*\n${changes}` : "";

    return `🔄 *Escala Atualizada*

Olá, ${participantName}! 👋

A escala foi *atualizada*:

➡️ *Escala:* ${scheduleName} \n
🗓️ *Data:* ${formattedDate}${formattedTime}${changesText}

Por favor, verifique as alterações.`;
  }

  /**
   * Envia notificação de escala para um participante
   */
  async sendScheduleNotification(params: {
    whatsapp: string;
    participantName: string;
    bandName: string;
    scheduleName: string;
    date: string;
    time?: string;
    instrument?: string;
    scheduleParticipantId?: string;
  }): Promise<WhatsAppNotificationResult> {
    try {
      const message = this.generateScheduleNotificationMessage(
        params.participantName,
        params.bandName,
        params.scheduleName,
        params.date,
        params.time,
        params.instrument,
        params.scheduleParticipantId,
      );

      const response = await evolutionAPI.sendText({
        number: params.whatsapp,
        text: message,
      });

      return {
        userId: "",
        success: true,
        messageId: response.key.id,
      };
    } catch (error) {
      return {
        userId: "",
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Envia notificações para todos os participantes de uma escala
   */
  async sendScheduleNotifications(
    payload: ScheduleNotificationPayload,
  ): Promise<WhatsAppNotificationResult[]> {
    const results: WhatsAppNotificationResult[] = [];

    for (const participant of payload.participants) {
      if (!participant.whatsapp) {
        results.push({
          userId: participant.userId,
          success: false,
          error: "Número de WhatsApp não cadastrado",
        });
        continue;
      }

      try {
        const scheduleParticipantId: string | undefined =
          "scheduleParticipantId" in participant
            ? participant.scheduleParticipantId
            : undefined;
        const message = this.generateScheduleNotificationMessage(
          participant.name,
          payload.bandName,
          payload.scheduleName,
          payload.date,
          payload.time,
          participant.instrument,
          scheduleParticipantId,
        );

        const response = await evolutionAPI.sendText({
          number: participant.whatsapp,
          text: message,
        });

        results.push({
          userId: participant.userId,
          success: true,
          messageId: response.key.id,
        });

        // Aguarda um pouco entre mensagens para evitar rate limiting
        await this.delay(1500);
      } catch (error) {
        results.push({
          userId: participant.userId,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return results;
  }

  /**
   * Envia lembrete de escala para todos os participantes
   */
  async sendScheduleReminders(
    payload: ScheduleNotificationPayload,
  ): Promise<WhatsAppNotificationResult[]> {
    const results: WhatsAppNotificationResult[] = [];

    for (const participant of payload.participants) {
      if (!participant.whatsapp) {
        results.push({
          userId: participant.userId,
          success: false,
          error: "Número de WhatsApp não cadastrado",
        });
        continue;
      }

      try {
        const message = this.generateScheduleReminderMessage(
          participant.name,
          payload.bandName,
          payload.scheduleName,
          payload.date,
          payload.time,
          participant.instrument,
        );

        const response = await evolutionAPI.sendText({
          number: participant.whatsapp,
          text: message,
        });

        results.push({
          userId: participant.userId,
          success: true,
          messageId: response.key.id,
        });

        await this.delay(1500);
      } catch (error) {
        results.push({
          userId: participant.userId,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return results;
  }

  /**
   * Envia mensagem de texto simples
   */
  async sendMessage(
    whatsapp: string,
    message: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await evolutionAPI.sendText({
        number: whatsapp,
        text: message,
      });

      return {
        success: true,
        messageId: response.key.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Verifica se o WhatsApp está conectado
   */
  async isConnected(): Promise<boolean> {
    return evolutionAPI.isConnected();
  }

  /**
   * Obtém QR Code para conexão
   */
  async getQRCode() {
    return evolutionAPI.getQRCode();
  }

  /**
   * Obtém estado da conexão
   */
  async getConnectionState() {
    return evolutionAPI.getConnectionState();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const whatsappService = new WhatsAppService();
