import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generateRecurringSchedules } from "@/lib/recurrence/recurrence-utils";

export const recurrenceRouter = createTRPCRouter({
  // Criar configuração de recorrência e gerar escalas
  create: publicProcedure
    .input(
      z.object({
        frequency: z.enum(["WEEKLY", "MONTHLY"]),
        dayOfWeek: z.number().min(0).max(6).optional(), // 0=Dom, 6=Sáb
        weekOfMonth: z.number().min(-1).max(4).optional(), // 1=primeira, -1=última
        time: z.date(),
        startDate: z.date(),
        endDate: z.date(),
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
      const { participants, ...configData } = input;

      // Criar configuração de recorrência
      const recurrenceConfig = await ctx.db.recurrenceConfig.create({
        data: {
          ...configData,
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
              participant: true,
            },
          },
        },
      });

      // Gerar todas as datas baseado na recorrência
      const dates = generateRecurringSchedules({
        frequency: input.frequency,
        dayOfWeek: input.dayOfWeek,
        weekOfMonth: input.weekOfMonth,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      // Criar escalas para cada data
      const schedules = await Promise.all(
        dates.map((date) =>
          ctx.db.schedule.create({
            data: {
              date,
              time: input.time,
              recurrenceType: "RECURRING",
              recurrenceGroupId: recurrenceConfig.id,
              createdById: input.createdById,
              notes: input.notes,
              participants: {
                create: participants.map((p) => ({
                  participantId: p.userId,
                  instrument: p.instrument,
                })),
              },
            },
          }),
        ),
      );

      return {
        recurrenceConfig,
        schedulesCreated: schedules.length,
        schedules,
      };
    }),

  // Listar todas as configurações de recorrência
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.recurrenceConfig.findMany({
      include: {
        participants: {
          include: {
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        schedules: {
          select: {
            id: true,
            date: true,
            status: true,
          },
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Buscar por ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.recurrenceConfig.findUnique({
        where: { id: input.id },
        include: {
          participants: {
            include: {
              participant: true,
            },
          },
          schedules: {
            include: {
              participants: {
                include: {
                  participant: true,
                },
              },
            },
            orderBy: {
              date: "asc",
            },
          },
        },
      });
    }),

  // Deletar configuração e todas as escalas futuras
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Deleta as escalas futuras (as passadas ficam como histórico)
      await ctx.db.schedule.deleteMany({
        where: {
          recurrenceGroupId: input.id,
          date: {
            gte: new Date(),
          },
        },
      });

      // Deleta a configuração
      return await ctx.db.recurrenceConfig.delete({
        where: { id: input.id },
      });
    }),

  // Atualizar participantes de todas as escalas futuras
  updateFutureParticipants: publicProcedure
    .input(
      z.object({
        recurrenceConfigId: z.string(),
        participants: z.array(
          z.object({
            userId: z.string(),
            instrument: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Buscar todas as escalas futuras
      const futureSchedules = await ctx.db.schedule.findMany({
        where: {
          recurrenceGroupId: input.recurrenceConfigId,
          date: {
            gte: new Date(),
          },
        },
      });

      // Atualizar participantes de cada escala
      const updates = await Promise.all(
        futureSchedules.map(async (schedule) => {
          // Deletar participantes atuais
          await ctx.db.scheduleParticipant.deleteMany({
            where: { scheduleId: schedule.id },
          });

          // Criar novos participantes
          return await ctx.db.scheduleParticipant.createMany({
            data: input.participants.map((p) => ({
              scheduleId: schedule.id,
              participantId: p.userId,
              instrument: p.instrument,
            })),
          });
        }),
      );

      // Atualizar também a configuração
      await ctx.db.recurrenceParticipant.deleteMany({
        where: { recurrenceConfigId: input.recurrenceConfigId },
      });

      await ctx.db.recurrenceParticipant.createMany({
        data: input.participants.map((p) => ({
          recurrenceConfigId: input.recurrenceConfigId,
          participantId: p.userId,
          instrument: p.instrument,
        })),
      });

      return { updated: updates.length };
    }),
});
