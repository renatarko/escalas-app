import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const scheduleRouter = createTRPCRouter({
  // Criar escala única (diária)
  createSingle: publicProcedure
    .input(
      z.object({
        date: z.date(),
        time: z.date(),
        notes: z.string().optional(),
        createdById: z.string(),
        participants: z.array(
          z.object({
            userId: z.string(),
            instrument: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { participants, ...scheduleData } = input;

      return await ctx.db.schedule.create({
        data: {
          ...scheduleData,
          recurrenceType: "SINGLE",
          participants: {
            create: participants.map((p) => ({
              participantId: p.userId,
              instrument: p.instrument,
            })),
          },
        },
        include: {
          participants: {
            include: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  whatsapp: true,
                },
              },
            },
          },
        },
      });
    }),

  // Listar escalas com filtros
  getAll: publicProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
          recurrenceType: z.enum(["SINGLE", "RECURRING"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input?.startDate || input?.endDate) {
        where.date = {};
        if (input.startDate) where.date.gte = input.startDate;
        if (input.endDate) where.date.lte = input.endDate;
      }

      if (input?.status) where.status = input.status;
      if (input?.recurrenceType) where.recurrenceType = input.recurrenceType;

      return await ctx.db.schedule.findMany({
        where,
        include: {
          participants: {
            include: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  whatsapp: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recurrenceConfig: {
            select: {
              id: true,
              frequency: true,
              dayOfWeek: true,
              weekOfMonth: true,
            },
          },
        },
        orderBy: { date: "asc" },
      });
    }),

  // Buscar escala por ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const schedule = await ctx.db.schedule.findUnique({
        where: { id: input.id },
        include: {
          participants: {
            include: {
              participant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  whatsapp: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recurrenceConfig: true,
        },
      });

      if (!schedule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Escala não encontrada",
        });
      }

      return schedule;
    }),

  // Atualizar escala individual
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date().optional(),
        time: z.date().optional(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.schedule.update({
        where: { id },
        data,
      });
    }),

  // Deletar escala individual
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.schedule.delete({
        where: { id: input.id },
      });
    }),

  // Confirmar participação
  confirmParticipation: publicProcedure
    .input(
      z.object({
        scheduleParticipantId: z.string(),
        confirmed: z.boolean(),
        justification: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.scheduleParticipant.update({
        where: { id: input.scheduleParticipantId },
        data: {
          confirmed: input.confirmed,
          justification: input.justification,
          confirmedAt: new Date(),
        },
      });
    }),
});
