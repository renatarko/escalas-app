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
      const { scheduleId, participantId, pendingConfirmationId } = input;

      return await ctx.db.$transaction(async (tx) => {
        const updated = await tx.scheduleParticipant.update({
          where: { scheduleId_participantId: { participantId, scheduleId } },
          data: { confirmed: true },
        });
        await tx.pendingConfirmation.update({
          where: {
            id: pendingConfirmationId,
          },
          data: { status: "completed" },
        });

        return { success: updated.confirmed };
      });
    }),
});
