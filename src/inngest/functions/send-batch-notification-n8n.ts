import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { processScheduleAndParticipantNotifications } from "@/server/services/whatsapp-notifications";
import { env } from "@/env";
import { db } from "@/server/db";
import { generateScheduleNotificationMessage } from "@/lib/whatsapp/service";
import { callSenderWorkflow } from "@/lib/n8n/service";

export const sendBatchNotificationN8N = inngest.createFunction(
  {
    id: "send-batch-notification-n8n",
    name: "Send Batch N8N Notification Webhook",
    retries: 3,
  },
  { event: "n8n/notification.send.batch" },
  async ({ event, step }) => {
    const { scheduleParticipantsId } = event.data as {
      scheduleParticipantsId: string[];
    };

    if (
      !Array.isArray(scheduleParticipantsId) ||
      scheduleParticipantsId.length === 0
    ) {
      throw new NonRetriableError("Nenhum scheduleParticipant fornecido");
    }

    // Processamento em lote
    const results = [];

    for (const scheduleParticipantId of scheduleParticipantsId) {
      const result = await step.run(
        `process-${scheduleParticipantId}`,
        async () => {
          let scheduleByParticipantInfo: Awaited<
            ReturnType<typeof processScheduleAndParticipantNotifications>
          > | null = null;

          try {
            // 1. Buscar info
            scheduleByParticipantInfo =
              await processScheduleAndParticipantNotifications({
                scheduleParticipantId,
              });

            if (
              !scheduleByParticipantInfo.schedule?.id ||
              !scheduleByParticipantInfo.member?.id ||
              !scheduleByParticipantInfo.member?.whatsapp
            ) {
              throw new NonRetriableError(
                `Dados inválidos para participante ${scheduleParticipantId}`,
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

            if (!pendingResponse.id) {
              throw new Error(`Erro ao salvar pending`);
            }

            const message = generateScheduleNotificationMessage({
              date: scheduleByParticipantInfo.schedule.date,
              scheduleName: scheduleByParticipantInfo.schedule.name,
              participantName: scheduleByParticipantInfo.member.name,
              scheduleParticipantId,
              pendingConfirmationId: pendingResponse.id,
              instrument: scheduleByParticipantInfo.member.instrument,
            });

            const payload = {
              ...scheduleByParticipantInfo,
              message,
            };

            // 4. Enviar para o webhook do n8n
            const response = await callSenderWorkflow(payload);

            if (response.message === "Workflow was started") {
              await db.scheduleParticipant.update({
                where: { id: scheduleParticipantId },
                data: {
                  notificationSent: true,
                  notificationSentAt: new Date(),
                },
              });
            }

            await db.notificationLog.create({
              data: {
                scheduleId: scheduleByParticipantInfo.schedule.id,
                scheduleParticipantId,
                participantId: scheduleByParticipantInfo.member.id,
                status: "success",
                type: "notification",
                message: "Messagem de confirmação enviada com sucesso",
              },
            });

            return {
              success: true,
              scheduleParticipantId,
              response,
            };
          } catch (error: unknown) {
            console.error("Erro ao enviar mensagem:", error);

            if (scheduleByParticipantInfo?.schedule?.id) {
              await db.notificationLog.create({
                data: {
                  scheduleId: scheduleByParticipantInfo.schedule.id,
                  scheduleParticipantId,
                  participantId: scheduleByParticipantInfo?.member?.id,
                  status: "error",
                  type: "notification",
                  error: error?.message ?? "Erro desconhecido",
                },
              });
            }

            return {
              success: false,
              scheduleParticipantId,
              error: error.message ?? "Erro desconhecido",
            };
          }
        },
      );

      results.push(result);
    }

    return {
      total: scheduleParticipantsId.length,
      success: results.filter((r) => r.success).length,
      errors: results.filter((r) => !r.success),
      items: results,
    };
  },
);
