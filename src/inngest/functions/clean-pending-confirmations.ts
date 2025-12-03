import { db } from "@/server/db";
import { inngest } from "../client";

export const expireAwaitingPendingConfirmations = inngest.createFunction(
  {
    id: "expire-awaiting-pending-confirmations",
    name: "Expire Awaiting PendingConfirmations",
    retries: 2,
  },
  // Roda 1x por dia às 03:00
  { cron: "0 3 * * *" },
  async ({ step }) => {
    const now = new Date();

    const expiredAwaiting = await step.run(
      "fetch-expired-awaiting",
      async () => {
        return await db.pendingConfirmation.findMany({
          where: {
            status: "awaiting_response",
            expiresAt: { lt: now },
          },
          include: {
            participant: true,
            schedule: true,
          },
        });
      },
    );

    if (expiredAwaiting.length === 0) {
      return {
        message: "Nenhuma pendingConfirmation awaiting_response expirada.",
      };
    }

    const results = [];

    for (const item of expiredAwaiting) {
      const result = await step.run(`expire-${item.id}`, async () => {
        try {
          await db.pendingConfirmation.update({
            where: { id: item.id },
            data: { status: "expired" },
          });

          return {
            id: item.id,
            whatsapp: item.whatsapp,
            scheduleId: item.scheduleId,
            participantId: item.participantId,
            action: "expired",
          };
        } catch (error: any) {
          console.error("Erro ao expirar pendingConfirmation:", error);
          return {
            id: item.id,
            error: error.message || "Erro desconhecido",
            action: "failed",
          };
        }
      });

      results.push(result);
    }

    return {
      timestamp: now.toISOString(),
      found: expiredAwaiting.length,
      processed: results.length,
      results,
    };
  },
);

export const cleanupExpiredOrCompletedPendingConfirmations =
  inngest.createFunction(
    {
      id: "cleanup-expired-pending-confirmations",
      name: "Cleanup Expired or Completed PendingConfirmations",
      retries: 2,
    },
    // CRON a cada 20 minutos
    { cron: "*/20 * * * *" },
    async ({ step }) => {
      const now = new Date();

      const expired = await step.run("fetch-expired", async () => {
        return await db.pendingConfirmation.findMany({
          where: {
            status: "completed",
            OR: [{ status: "completed" }, { expiresAt: { lt: now } }],
          },
          include: {
            participant: true,
            schedule: true,
          },
        });
      });

      if (expired.length === 0) {
        return {
          message: "Nenhum pendingConfirmation expirado encontrado",
        };
      }

      const results = [];

      for (const item of expired) {
        const result = await step.run(`process-${item.id}`, async () => {
          try {
            await db.pendingConfirmation.delete({
              where: { id: item.id },
            });

            return {
              id: item.id,
              whatsapp: item.whatsapp,
              scheduleId: item.scheduleId,
              participantId: item.participantId,
              action: "deleted",
            };
          } catch (error: any) {
            console.error("Erro ao processar pendingConfirmation:", error);
            return {
              id: item.id,
              error: error.message || "Erro desconhecido",
              action: "failed",
            };
          }
        });

        results.push(result);
      }

      return {
        timestamp: now.toISOString(),
        found: expired.length,
        processed: results.length,
        results,
      };
    },
  );
