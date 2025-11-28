import { inngest } from "../client";
import { db } from "@/server/db";
import { processScheduleNotifications } from "@/server/services/whatsapp-notifications";

// Evento para enviar notificação de escala
export const sendScheduleNotification = inngest.createFunction(
  {
    id: "send-schedule-notification",
    name: "Send Schedule WhatsApp Notification",
    retries: 3,
  },
  { event: "schedule/notification.send" },
  async ({ event, step }) => {
    const {
      scheduleId,
      type = "notification",
      changes,
    } = event.data as {
      scheduleId: string;
      type?: "notification" | "reminder" | "cancellation" | "update";
      changes?: string;
    };

    return step.run("process-notifications", async () =>
      processScheduleNotifications({ scheduleId, type, changes }),
    );
  },
);

// Evento para enviar lembrete de escala (pode ser agendado)
export const sendScheduleReminder = inngest.createFunction(
  {
    id: "send-schedule-reminder",
    name: "Send Schedule WhatsApp Reminder",
    retries: 3,
  },
  { event: "schedule/reminder.send" },
  async ({ event, step }) => {
    const { scheduleId } = event.data as { scheduleId: string };

    // Reutiliza a lógica de notificação com tipo "reminder"
    return step.invoke("send-reminder", {
      function: sendScheduleNotification,
      data: {
        scheduleId,
        type: "reminder",
      },
    });
  },
);

// Cron job para enviar lembretes automáticos (24h antes)
export const scheduledReminders = inngest.createFunction(
  {
    id: "scheduled-reminders",
    name: "Send Scheduled Reminders",
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
        select: { id: true },
      });
    });

    if (schedules.length === 0) {
      return { message: "Nenhuma escala para amanhã", sent: 0 };
    }

    // Enviar lembretes para cada escala
    const results = await step.run("send-reminders", async () => {
      const promises = schedules.map((schedule) =>
        inngest.send({
          name: "schedule/notification.send",
          data: {
            scheduleId: schedule.id,
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
