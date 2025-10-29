import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { generateRecurringSchedules } from "@/lib/recurrence/recurrence-utils";

export const recurrenceRouter = createTRPCRouter({
  // Criar configuração de recorrência e gerar escalas
  create: publicProcedure
    .input(
      z.object({
        bandId: z.string(),
        name: z.string(),
        frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
        dayOfWeek: z.number().min(0).max(6).optional(), // 0=Dom, 6=Sáb
        weekOfMonth: z.number().min(-1).max(4).optional(), // 1=primeira, -1=última
        time: z
          .string()
          .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Formato de hora inválido (HH:MM)",
          )
          .optional(),
        startDate: z.date(),
        endDate: z.date(),
        notes: z.string().optional(),
        participants: z.array(
          z.object({
            participantId: z.string(),
            instrument: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { participants, name, ...configData } = input;
      const { session } = ctx;

      if (!session?.user) {
        throw new Error("User must be logged");
      }

      // Criar configuração de recorrência
      const recurrenceConfig = await ctx.db.recurrenceConfig.create({
        data: {
          ...configData,
          createdById: session.user.id,
          participants: {
            create: participants.map((p) => ({
              participantId: p.participantId,
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

      let timeDate = null;
      if (input.time) {
        const [hours, minutes] = input.time.split(":").map(Number);
        timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
      }

      // Criar escalas para cada data
      const schedules = await Promise.all(
        dates.map((date) =>
          ctx.db.schedule.create({
            data: {
              createdById: session.user.id,
              bandId: input.bandId,
              name,
              date,
              time: timeDate,
              recurrenceType: "RECURRING",
              recurrenceGroupId: recurrenceConfig.id,
              notes: input.notes,
              participants: {
                create: participants.map((p) => ({
                  participantId: p.participantId,
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
  getAll: publicProcedure
    .input(z.object({ bandId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { bandId } = input;
      return await ctx.db.recurrenceConfig.findMany({
        where: { bandId },
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
