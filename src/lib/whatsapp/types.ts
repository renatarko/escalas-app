// Tipos para Evolution API

export interface EvolutionInstance {
  instanceName: string;
  instanceId: string;
  status: "open" | "close" | "connecting";
  owner: string;
  profileName?: string;
  profilePictureUrl?: string;
}

export interface EvolutionQRCode {
  pairingCode?: string;
  code: string;
  base64: string;
  count: number;
}

export interface EvolutionConnectionState {
  instance: string;
  state: "open" | "close" | "connecting";
}

export interface EvolutionSendTextMessage {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
}

export interface EvolutionSendMessageResponse {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    extendedTextMessage?: {
      text: string;
    };
    conversation?: string;
  };
  messageTimestamp: string;
  status: string;
}

export interface EvolutionWebhookMessage {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageTimestamp?: number;
  };
}

export interface ScheduleNotificationPayload {
  scheduleId: string;
  bandName: string;
  scheduleName: string;
  date: string;
  time?: string;
  participants: {
    userId: string;
    name: string;
    whatsapp: string;
    instrument: string;
  }[];
}

export interface WhatsAppNotificationResult {
  userId: string;
  success: boolean;
  messageId?: string;
  error?: string;
}
