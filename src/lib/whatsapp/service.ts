import { format } from "date-fns";
import type { Instrument } from "../types";
import { SetInstrument } from "../utils/setInstrument";
import { env } from "@/env";
import { evolutionAPI } from "./evolution-api";

type generateMessage = {
  participantName: string;
  scheduleName: string;
  date: Date;
  instrument: string;
  scheduleParticipantId?: string;
};

/**
 * Formata a data para exibição em português
 */
function formatDate(dateStr: string): string {
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
function formatTime(timeStr?: string): string {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Verifica se o WhatsApp está conectado
 */
async function isConnected(): Promise<boolean> {
  return evolutionAPI.isConnected();
}

/**
 * Obtém QR Code para conexão
 */
async function getQRCode() {
  return evolutionAPI.getQRCode();
}

/**
 * Obtém estado da conexão
 */
async function getConnectionState() {
  return evolutionAPI.getConnectionState();
}

/**
 * Gera mensagem de notificação de escala
 */
const generateScheduleNotificationMessage = ({
  participantName,
  scheduleName,
  date,
  instrument,
  scheduleParticipantId,
  pendingConfirmationId,
}: generateMessage & {
  pendingConfirmationId: string;
}): string => {
  const formattedDate = format(date, "dd/MM/yyyy");
  const instrumentText =
    SetInstrument(instrument as Instrument).label ??
    instrument ??
    "Instrumento não cadastrado";
  const instrumentIcon = SetInstrument(instrument as Instrument).icon ?? "";

  const confirmationInstructions =
    scheduleParticipantId &&
    `✅ Para confirmar sua presença, clique: 
${env.NEXT_PUBLIC_API_URL}/confirmation/${pendingConfirmationId}

_Aguardamos sua confirmação._`;

  return `Olá, ${participantName}! 👋

Você foi escalado(a) para escala *${scheduleName}*
🗓️ ${formattedDate}
${instrumentIcon} ${instrumentText} \n
${confirmationInstructions}`;
};

/**
 * Gera mensagem de lembrete de escala
 */
function generateScheduleReminderMessage({
  participantName,
  scheduleName,
  date,
  instrument,
}: generateMessage): string {
  const formattedDate = formatDate(date);
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
function generateScheduleCancellationMessage(
  participantName: string,
  scheduleName: string,
  date: string,
): string {
  const formattedDate = formatDate(date);

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
function generateScheduleUpdateMessage(
  participantName: string,
  scheduleName: string,
  date: string,
  time?: string,
  changes?: string,
): string {
  const formattedDate = formatDate(date);
  const formattedTime = time ? ` às ${formatTime(time)}` : "";
  const changesText = changes ? `\n\n📝 *Alterações:*\n${changes}` : "";

  return `🔄 *Escala Atualizada*

Olá, ${participantName}! 👋

A escala foi *atualizada*:

➡️ *Escala:* ${scheduleName} \n
🗓️ *Data:* ${formattedDate}${formattedTime}${changesText}

Por favor, verifique as alterações.`;
}

export {
  formatDate,
  formatTime,
  generateScheduleNotificationMessage,
  generateScheduleReminderMessage,
  generateScheduleCancellationMessage,
  generateScheduleUpdateMessage,
  isConnected,
  getQRCode,
  getConnectionState,
};
