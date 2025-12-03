export type ScheduleNotificationPayload = {
  evolution: {
    instance: string;
    serverUrl: string;
    apikey: string;
  };
  app: {
    webhookUrl: string;
    xApiKey: string;
  };
  schedule: {
    id: string;
    date: string;
    name: string;
  };
  member: {
    id: string;
    name: string;
    whatsapp: string;
    instrument: string | null;
    confirmed: boolean | null;
  };
};
