import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const notificationLogRouter = createTRPCRouter({
  listBySchedule: protectedProcedure
    .input(
      z.object({
        scheduleId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { scheduleId, limit } = input;

      const memberships = await ctx.db.bandMember.findMany({
        where: { userId: ctx.session.user.id, isActive: true },
        select: { bandId: true },
      });

      if (!memberships.length) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Usuário não possui permissão para visualizar logs",
        });
      }

      const schedules = await ctx.db.schedule.findMany({
        where: {
          bandId: { in: memberships.map((membership) => membership.bandId) },
          ...(scheduleId ? { id: scheduleId } : {}),
        },
        select: { id: true },
      });

      if (!schedules.length) return [];

      return ctx.db.notificationLog.findMany({
        where: {
          scheduleId: scheduleId ?? {
            in: schedules.map((schedule) => schedule.id),
          },
        },
        include: {
          scheduleParticipant: {
            select: {
              id: true,
              participant: {
                select: {
                  name: true,
                },
              },
              schedule: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    }),
});
