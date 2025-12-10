import { processScheduleAndParticipantNotifications } from "@/server/services/whatsapp-notifications";
import { inngest } from "../client";
import { env } from "@/env";
import { NonRetriableError } from "inngest";
import type { ScheduleNotificationPayload } from "./types";
import { generateScheduleNotificationMessage } from "@/lib/whatsapp/whatsapp-service";
import { db } from "@/server/db";

export const sendNotificationN8N = inngest.createFunction(
  {
    id: "send-notification-n8n",
    name: "Send N8N Notification Webhook",
    retries: 3,
  },
  { event: "n8n/notification.send" },
  async ({ event, step }) => {
    const { scheduleParticipant } = event.data as {
      scheduleParticipant: string;
    };

    const scheduleByParticipantInfo = await step.run(
      "fetch-schedule-participant-info",
      async () => {
        try {
          const info = await processScheduleAndParticipantNotifications({
            scheduleParticipant,
          });

          // Validar dados retornados
          if (
            !info.schedule?.id ||
            !info.member?.id ||
            !info.member?.whatsapp
          ) {
            throw new NonRetriableError(
              "Dados inválidos: schedule, member ou whatsapp ausentes",
            );
          }

          return info;
        } catch (error) {
          console.error("Erro ao buscar informações:", error);
          throw error;
        }
      },
    );

    const pendingId = await step.run("save-pending-confirmation", async () => {
      try {
        const response = await db.pendingConfirmation.create({
          data: {
            whatsapp: scheduleByParticipantInfo.member.whatsapp,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
            status: "awaiting_response",
            participantId: scheduleByParticipantInfo.member.id,
            scheduleId: scheduleByParticipantInfo.schedule.id,
          },
        });

        if (!response) {
          const error = await response.json();
          throw new Error(`Erro ao salvar sessão: ${error}`);
        }

        return response.id;
      } catch (error) {
        console.error("Erro ao salvar pending confirmation:", error);
        throw error;
      }
    });

    const payload: ScheduleNotificationPayload = await step.run(
      "prepare-payload",
      async () => {
        // TODO: Buscar dados da igreja/banda do banco para pegar serverUrl e apikey
        // const band = await db.band.findUnique({
        //   where: { id: scheduleByParticipantInfo.schedule.bandId },
        //   select: { evolutionServerUrl: true, evolutionApiKey: true }
        // });
        const message = generateScheduleNotificationMessage({
          bandName: scheduleByParticipantInfo.schedule.name,
          date: scheduleByParticipantInfo.schedule.date,
          scheduleName: scheduleByParticipantInfo.schedule.name,
          participantName: scheduleByParticipantInfo.member.name,
          scheduleParticipantId: scheduleParticipant,
          pendingConfirmationId: pendingId,
          instrument: scheduleByParticipantInfo.member.instrument,
        });

        return {
          evolution: {
            instance: env.EVOLUTION_INSTANCE_NAME,
            serverUrl: env.EVOLUTION_API_URL, // TODO: usar band.evolutionServerUrl
            apikey: "DB678B3D5F36-47D6-BC95-C7FD516D0140", // TODO: usar band.evolutionApiKey
          },
          app: {
            webhookUrl: env.NEXT_PUBLIC_API_URL,
            xApiKey: env.EVOLUTION_API_KEY,
          },
          ...scheduleByParticipantInfo,
          message,
        };
      },
    );

    const n8nResponse = await step.run("call-n8n-webhook", async () => {
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
          throw new Error(
            `N8N webhook falhou: ${response.status} - ${errorText}`,
          );
        }

        const result = await response.json();
        console.log("N8N webhook success:", result);
        return result;
      } catch (error) {
        console.error("Erro ao chamar N8N webhook:", error);
        throw error;
      }
    });

    await step.run("log-notification-sent", async () => {
      console.log("Notificação enviada com sucesso:", {
        scheduleParticipant,
        scheduleId: payload.schedule.id,
        memberId: payload.member.id,
        whatsapp: payload.member.whatsapp,
        timestamp: new Date().toISOString(),
      });
    });

    return {
      success: true,
      type: "notification",
      scheduleParticipant,
      n8nResponse,
    };
  },
);

// // Função auxiliar para disparar o evento (use no seu código)
// export async function triggerScheduleNotification(
//   scheduleParticipantId: string,
// ) {
//   await inngest.send({
//     name: "n8n/notification.send",
//     data: {
//       scheduleParticipant: scheduleParticipantId,
//     },
//   });
// }
