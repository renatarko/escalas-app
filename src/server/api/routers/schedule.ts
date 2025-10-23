// server/api/routers/schedule.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { RecurrenceFrequency, RecurrenceType } from "@prisma/client";

// Schema de validação para participantes
const participantSchema = z.object({
  participantId: z.string(),
  instrument: z.string().min(1, "Instrumento é obrigatório"),
});

// Schema para escala única
const createSingleScheduleSchema = z.object({
  date: z.date(),
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora inválido (HH:MM)",
    ),
  notes: z.string().optional(),
  participants: z
    .array(participantSchema)
    .min(1, "Pelo menos um participante é necessário"),
});

// Schema para escala recorrente
const createRecurringScheduleSchema = z.object({
  frequency: z.nativeEnum(RecurrenceFrequency),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  weekOfMonth: z.number().int().min(1).max(5).optional(),
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora inválido (HH:MM)",
    ),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().optional(),
  participants: z
    .array(participantSchema)
    .min(1, "Pelo menos um participante é necessário"),
});

export const scheduleRouter = createTRPCRouter({
  // Criar escala única
  createSingle: protectedProcedure
    .input(createSingleScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, time, notes, participants } = input;

      // Converter string de tempo para DateTime
      const [hours, minutes] = time.split(":").map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);

      try {
        const schedule = await ctx.db.schedule.create({
          data: {
            date,
            time: timeDate,
            notes,
            recurrenceType: RecurrenceType.SINGLE,
            createdById: ctx.session.user.id,
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
              },
            },
          },
        });

        return {
          success: true,
          schedule,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar escala",
        });
      }
    }),

  // Criar escala recorrente
  createRecurring: protectedProcedure
    .input(createRecurringScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        frequency,
        dayOfWeek,
        weekOfMonth,
        time,
        startDate,
        endDate,
        notes,
        participants,
      } = input;

      // Validações
      if (frequency === RecurrenceFrequency.WEEKLY && dayOfWeek === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "dayOfWeek é obrigatório para recorrência semanal",
        });
      }

      if (
        frequency === RecurrenceFrequency.MONTHLY &&
        (dayOfWeek === undefined || weekOfMonth === undefined)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "dayOfWeek e weekOfMonth são obrigatórios para recorrência mensal",
        });
      }

      if (endDate <= startDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Data final deve ser maior que data inicial",
        });
      }

      // Converter string de tempo para DateTime
      const [hours, minutes] = time.split(":").map(Number);
      const timeDate = new Date();
      timeDate.setHours(hours, minutes, 0, 0);

      try {
        // Criar configuração de recorrência
        const recurrenceConfig = await ctx.db.recurrenceConfig.create({
          data: {
            frequency,
            dayOfWeek,
            weekOfMonth,
            time: timeDate,
            startDate,
            endDate,
            notes,
            createdById: ctx.session.user.id,
            participants: {
              create: participants.map((p) => ({
                participantId: p.participantId,
                instrument: p.instrument,
              })),
            },
          },
        });

        // Gerar datas das escalas
        const scheduleDates = generateScheduleDates(
          frequency,
          startDate,
          endDate,
          dayOfWeek,
          weekOfMonth,
        );

        // Criar todas as escalas
        const schedules = await ctx.db.$transaction(
          scheduleDates.map((date) =>
            ctx.db.schedule.create({
              data: {
                date,
                time: timeDate,
                notes,
                recurrenceType: RecurrenceType.RECURRING,
                recurrenceGroupId: recurrenceConfig.id,
                createdById: ctx.session.user.id,
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
          success: true,
          recurrenceConfig,
          schedulesCreated: schedules.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar escalas recorrentes",
        });
      }
    }),

  // Listar escalas
  list: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, status } = input;

      const schedules = await ctx.db.schedule.findMany({
        where: {
          ...(startDate && { date: { gte: startDate } }),
          ...(endDate && { date: { lte: endDate } }),
          ...(status && { status }),
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
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recurrenceConfig: true,
        },
        orderBy: [{ date: "asc" }, { time: "asc" }],
      });

      return schedules;
    }),

  // Buscar escala por ID
  getById: protectedProcedure
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
            },
          },
          recurrenceConfig: {
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
            },
          },
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
});

// Função auxiliar para gerar datas das escalas
function generateScheduleDates(
  frequency: RecurrenceFrequency,
  startDate: Date,
  endDate: Date,
  dayOfWeek?: number,
  weekOfMonth?: number,
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  if (frequency === RecurrenceFrequency.WEEKLY && dayOfWeek !== undefined) {
    // Ajustar para o primeiro dia da semana especificado
    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }

    // Gerar todas as datas semanais
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  } else if (
    frequency === RecurrenceFrequency.MONTHLY &&
    dayOfWeek !== undefined &&
    weekOfMonth !== undefined
  ) {
    // Gerar datas mensais (ex: 2ª quarta-feira do mês)
    while (current <= endDate) {
      const monthDate = getNthWeekdayOfMonth(
        current.getFullYear(),
        current.getMonth(),
        dayOfWeek,
        weekOfMonth,
      );

      if (monthDate && monthDate >= startDate && monthDate <= endDate) {
        dates.push(monthDate);
      }

      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
}

// Função para obter o n-ésimo dia da semana em um mês
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekOfMonth: number,
): Date | null {
  const firstDay = new Date(year, month, 1);
  let count = 0;
  let current = new Date(firstDay);

  while (current.getMonth() === month) {
    if (current.getDay() === dayOfWeek) {
      count++;
      if (count === weekOfMonth) {
        return current;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return null;
}
