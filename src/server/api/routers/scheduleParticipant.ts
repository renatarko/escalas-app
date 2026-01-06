import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { sendWhatsAppMessage } from "@/server/services/send-whatsapp";

export const scheduleParticipantRouter = createTRPCRouter({
  updateById: publicProcedure
    .input(
      z.object({
        participantId: z.string(),
        scheduleId: z.string(),
        confirmed: z.boolean().optional(),
        pendingConfirmationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { scheduleId, participantId, pendingConfirmationId, confirmed } =
        input;

      try {
        const updated = await ctx.db.$transaction(async (tx) => {
          const scheduleParticipant = await tx.scheduleParticipant.update({
            where: { scheduleId_participantId: { participantId, scheduleId } },
            include: { participant: { select: { whatsapp: true } } },
            data: { confirmed, confirmedAt: new Date() },
          });

          await tx.pendingConfirmation.update({
            where: {
              id: pendingConfirmationId,
            },
            data: { status: "completed" },
          });

          await ctx.db.notificationLog.create({
            data: {
              scheduleId: updated.scheduleId,
              scheduleParticipantId: updated.id,
              participantId: updated.participantId,
              status: "success",
              type: "confirmation",
              message: `Participante ${confirmed ? "confirmou presença" : "confirmou ausência"} via link`,
            },
          });

          const message = `Recebemos sua *${confirmed ? "confirmação de presença" : "confirmação de ausência"}* com sucesso.`;
          await sendWhatsAppMessage(
            scheduleParticipant.participant.whatsapp ?? "",
            message,
          );

          return scheduleParticipant;
        });

        return { success: true };
      } catch (error) {
        console.error("Erro ao confirmar participação", error);

        try {
          await ctx.db.notificationLog.create({
            data: {
              scheduleId,
              participantId,
              status: "error",
              type: "confirmation",
              error:
                error instanceof Error
                  ? error.message
                  : "Erro ao confirmar participação",
            },
          });
        } catch (logError) {
          console.error("Falha ao registrar log de confirmação", logError);
        }

        throw error;
      }
    }),
});
