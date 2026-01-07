import { NonRetriableError } from "inngest";
import { inngest } from "../client";
import { processScheduleAndParticipantNotifications } from "@/server/services/whatsapp-notifications";
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
    const { scheduleParticipantsId, type = "notification" } = event.data as {
      scheduleParticipantsId: string[];
      type?: "notification" | "reminder";
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
                type,
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
                type,
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
                  type,
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
      type,
    };
  },
);

// Cron job para enviar lembretes automáticos (24h antes)
export const scheduledRemindersCron = inngest.createFunction(
  {
    id: "scheduled-reminders",
    name: "CRON - Send Scheduled Reminders",
  },
  { cron: "0 9 * * *" }, // Executa diariamente às 9h da manhã
  async ({ step }) => {
    // Buscar escalas de amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const schedules = await step.run("fetch-tomorrow-schedules", async () => {
      return db.schedule.findMany({
        where: {
          date: {
            gte: tomorrow,
            lt: dayAfter,
          },
          status: "PENDING",
        },
        select: {
          id: true,
          participants: { select: { participantId: true, scheduleId: true } },
        },
      });
    });

    if (schedules.length === 0) {
      return { message: "Nenhuma escala para amanhã", sent: 0 };
    }

    const scheduleParticipantIds = await step.run(
      "fetch-tomorrow-scheduleParticipantIds",
      async () => {
        return db.scheduleParticipant.findMany({
          where: {
            scheduleId: { in: schedules.map((sc) => sc.id) },
          },
          select: { id: true },
        });
      },
    );

    if (schedules.length === 0) {
      return { message: "Não há schedule participant ids", sent: 0 };
    }

    // Enviar lembretes para cada escala
    const results = await step.run("send-reminders", async () => {
      const promises = scheduleParticipantIds.map(({ id }) =>
        inngest.send({
          name: "n8n/notification.send.batch",
          data: {
            scheduleParticipantsId: id,
            type: "reminder",
          },
        }),
      );

      return Promise.all(promises);
    });

    return {
      message: `Lembretes agendados para ${schedules.length} escalas`,
      scheduleIds: schedules.map((s) => s.id),
      results,
    };
  },
);
