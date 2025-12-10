import z from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const pendingConfirmationRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pendingConfirmation = await ctx.db.pendingConfirmation.findUnique({
        where: { id: input.id },
        include: {
          participant: {
            select: {
              name: true,
            },
          },
          schedule: {
            select: {
              name: true,
              band: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return pendingConfirmation;
    }),
});
