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

interface Evolution {
  instance: string;
  serverUrl: string;
  apikey: string;
}

interface AppCredentials {
  webhookUrl: string;
  xApiKey: string;
}

interface Schedule {
  id: string;
  date: Date;
  name: string;
}

interface Member {
  id: string;
  name: string;
  whatsapp: string;
  instrument: string | null;
  confirmed: boolean | null;
}

export interface ScheduleNotificationPayload {
  evolution: Evolution;
  app: AppCredentials;
  schedule: Schedule;
  member: Member;
  message: string;
}

export interface ScheduleNotificationInBatchPayload {
  evolution: Evolution;
  app: AppCredentials;
  schedule: Schedule;
  members: Member[];
  message?: string;
}

export interface ScheduleParticipantNotificationPayload {
  evolution: Evolution;
  app: AppCredentials;
  schedule: Schedule;
  member: Member;
  message?: string;
}

export interface WhatsAppNotificationResult {
  userId: string;
  success: boolean;
  messageId?: string;
  error?: string;
}
