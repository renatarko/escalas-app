import { env } from "@/env";
import type { ScheduleNotificationPayload } from "../whatsapp";

export const callSenderWorkflow = async (
  payload: ScheduleNotificationPayload,
) => {
  try {
    const n8nUrl = env.N8N_BASE_URL.endsWith("/")
      ? `${env.N8N_BASE_URL}webhook/whatsapp-confirmation`
      : `${env.N8N_BASE_URL}/webhook/whatsapp-confirmation`;

    const response = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N webhook falhou: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as {
      message: string;
      success: boolean;
    };
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Can't call n8n workflow");
  }
};
