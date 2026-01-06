import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
            data: { confirmed, confirmedAt: new Date() },
          });

          await tx.pendingConfirmation.update({
            where: {
              id: pendingConfirmationId,
            },
            data: { status: "completed" },
          });

          return scheduleParticipant;
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
