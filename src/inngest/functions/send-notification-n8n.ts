import { processScheduleAndParticipantNotifications } from "@/server/services/whatsapp-notifications";
import { inngest } from "../client";
import { db } from "@/server/db";
import { callSenderWorkflow } from "@/lib/n8n/service";

export const sendNotificationN8N = inngest.createFunction(
  {
    id: "send-notification-n8n",
    name: "Send N8N Notification Webhook",
    retries: 3,
  },
  { event: "n8n/notification.send" },
  async ({ event, step }) => {
    const { scheduleParticipantId, type = "notification" } = event.data as {
      scheduleParticipantId: string;
      type?: "notification" | "reminder" | "cancellation" | "update";
    };

    const scheduleByParticipantInfo = await step.run(
      "fetch-schedule-participant-info",
      async () => {
        try {
          const payload = await processScheduleAndParticipantNotifications({
            scheduleParticipantId,
            type,
          });

          return payload;
        } catch (error) {
          console.error("Erro ao buscar informações:", error);
          throw error;
        }
      },
    );

    const n8nResponse = await step.run("call-n8n-webhook", async () => {
      try {
        const response = await callSenderWorkflow(scheduleByParticipantInfo);

        if (response.message === "Workflow was started") {
          await db.scheduleParticipant.update({
            where: { id: scheduleParticipantId },
            data: { notificationSent: true, notificationSentAt: new Date() },
          });
        }
        return response;
      } catch (error) {
        await db.notificationLog.create({
          data: {
            scheduleId: scheduleByParticipantInfo.schedule.id,
            scheduleParticipantId,
            participantId: scheduleByParticipantInfo.member.id,
            status: "error",
            type: "notification",
            error:
              error instanceof Error ? error.message : "Erro ao enviar webhook",
          },
        });
        throw error;
      }
    });

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

        if (!response?.id) {
          throw new Error("Erro ao salvar sessão: id não retornado");
        }

        return response.id;
      } catch (error) {
        console.error("Erro ao salvar pending confirmation:", error);
        throw error;
      }
    });

    await step.run("create-log-notification-sent", async () => {
      await db.notificationLog.create({
        data: {
          scheduleId: scheduleByParticipantInfo.schedule.id,
          scheduleParticipantId,
          participantId: scheduleByParticipantInfo.member.id,
          status: "success",
          type: "notification",
          message: `Messagem de confirmação enviada com sucesso`,
        },
      });
    });

    return {
      success: true,
      type,
      scheduleParticipantId,
      pendingId,
      n8nResponse,
    };
  },
);

export const sendScheduleReminder = inngest.createFunction(
  {
    id: "send-schedule-reminder",
    name: "Send Schedule WhatsApp Reminder",
    retries: 3,
  },
  { event: "schedule/reminder.send" },
  async ({ event, step }) => {
    const { scheduleParticipantId } = event.data as {
      scheduleParticipantId: string;
    };

    // Reutiliza a lógica de notificação com tipo "reminder"
    return step.invoke("send-reminder", {
      function: sendNotificationN8N,
      data: {
        scheduleParticipantId,
        type: "reminder",
      },
    });
  },
);
