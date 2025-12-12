import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { processScheduleAndParticipantNotifications } from "@/server/services/whatsapp-notifications";
import { env } from "@/env";
import { db } from "@/server/db";
import { generateScheduleNotificationMessage } from "@/lib/whatsapp/whatsapp-service";

export const sendBatchNotificationN8N = inngest.createFunction(
  {
    id: "send-batch-notification-n8n",
    name: "Send Batch N8N Notification Webhook",
    retries: 3,
  },
  { event: "n8n/notification.send.batch" },
  async ({ event, step }) => {
    const { scheduleParticipants } = event.data as {
      scheduleParticipants: string[];
    };

    if (
      !Array.isArray(scheduleParticipants) ||
      scheduleParticipants.length === 0
    ) {
      throw new NonRetriableError("Nenhum scheduleParticipant fornecido");
    }

    // Processamento em lote
    const results = [];

    for (const scheduleParticipant of scheduleParticipants) {
      const result = await step.run(
        `process-${scheduleParticipant}`,
        async () => {
          let scheduleByParticipantInfo: Awaited<
            ReturnType<typeof processScheduleAndParticipantNotifications>
          > | null = null;

          try {
            // 1. Buscar info
            scheduleByParticipantInfo =
              await processScheduleAndParticipantNotifications({
                scheduleParticipant,
              });

            if (
              !scheduleByParticipantInfo.schedule?.id ||
              !scheduleByParticipantInfo.member?.id ||
              !scheduleByParticipantInfo.member?.whatsapp
            ) {
              throw new NonRetriableError(
                `Dados inválidos para participante ${scheduleParticipant}`,
              );
            }

            const pendingResponse = await db.pendingConfirmation.create({
              data: {
                whatsapp: scheduleByParticipantInfo.member.whatsapp,
                expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
                status: "awaiting_response",
                participantId: scheduleByParticipantInfo.member.id,
                scheduleId: scheduleByParticipantInfo.schedule.id,
              },
            });

            // 2. Criar payload
            // const payload: ScheduleNotificationPayload = {
            //   evolution: {
            //     instance: env.EVOLUTION_INSTANCE_NAME,
            //     serverUrl: env.EVOLUTION_API_URL,
            //     apikey: "DB678B3D5F36-47D6-BC95-C7FD516D0140",
            //   },
            //   app: {
            //     webhookUrl: env.NEXT_PUBLIC_API_URL,
            //     xApiKey: env.EVOLUTION_API_KEY,
            //   },
            //   ...scheduleByParticipantInfo,
            // };

            if (!pendingResponse.id) {
              throw new Error(`Erro ao salvar pending`);
            }

            const message = generateScheduleNotificationMessage({
              bandName: scheduleByParticipantInfo.schedule.name,
              date: scheduleByParticipantInfo.schedule.date,
              scheduleName: scheduleByParticipantInfo.schedule.name,
              participantName: scheduleByParticipantInfo.member.name,
              scheduleParticipantId: scheduleParticipant,
              pendingConfirmationId: pendingResponse.id,
              instrument: scheduleByParticipantInfo.member.instrument,
            });

            const payload = {
              evolution: {
                instance: env.EVOLUTION_INSTANCE_NAME,
                serverUrl: env.EVOLUTION_API_URL,
                apikey: "DB678B3D5F36-47D6-BC95-C7FD516D0140",
              },
              app: {
                webhookUrl: env.NEXT_PUBLIC_API_URL,
                xApiKey: env.EVOLUTION_API_KEY,
              },
              ...scheduleByParticipantInfo,
              message,
            };

            // 4. Enviar para o webhook do n8n
            const n8nUrl = env.N8N_BASE_URL.endsWith("/")
              ? `${env.N8N_BASE_URL}webhook/whatsapp-confirmation`
              : `${env.N8N_BASE_URL}/webhook/whatsapp-confirmation`;

            const webhook = await fetch(n8nUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": env.EVOLUTION_API_KEY,
              },
              body: JSON.stringify(payload),
            });

            if (!webhook.ok) {
              const errText = await webhook.text();
              throw new Error(`N8N falhou: ${webhook.status} - ${errText}`);
            }

            const webhookResult = await webhook.json();

            console.log("Mensagem enviada:", {
              scheduleParticipant,
              whatsapp: payload.member.whatsapp,
            });

            await db.notificationLog.create({
              data: {
                scheduleId: scheduleByParticipantInfo.schedule.id,
                scheduleParticipantId: scheduleParticipant,
                participantId: scheduleByParticipantInfo.member.id,
                status: "success",
                type: "notification",
                message: "Messagem de confirmação enviada com sucesso",
              },
            });

            return {
              success: true,
              scheduleParticipant,
              response: webhookResult,
            };
          } catch (error: any) {
            console.error("Erro ao enviar mensagem:", error);

            if (scheduleByParticipantInfo?.schedule?.id) {
              await db.notificationLog.create({
                data: {
                  scheduleId: scheduleByParticipantInfo.schedule.id,
                  scheduleParticipantId: scheduleParticipant,
                  participantId: scheduleByParticipantInfo?.member?.id,
                  status: "error",
                  type: "notification",
                  error: error?.message ?? "Erro desconhecido",
                },
              });
            }

            return {
              success: false,
              scheduleParticipant,
              error: error.message ?? "Erro desconhecido",
            };
          }
        },
      );

      results.push(result);
    }

    return {
      total: scheduleParticipants.length,
      success: results.filter((r) => r.success).length,
      errors: results.filter((r) => !r.success),
      items: results,
    };
  },
);
