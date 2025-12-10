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
  bandId: z.string(),
  name: z.string(),
  date: z.date(),
  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Formato de hora inválido (HH:MM)",
    )
    .optional(),
  notes: z.string().optional(),
  participants: z
    .array(participantSchema)
    .min(1, "Pelo menos um participante é necessário"),
});

// Schema para escala recorrente
const createRecurringScheduleSchema = z.object({
  bandId: z.string(),
  name: z.string(),
  frequency: z.nativeEnum(RecurrenceFrequency),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  weekOfMonth: z.number().int().min(1).max(5).optional(),
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
  participants: z
    .array(participantSchema)
    .min(1, "Pelo menos um participante é necessário"),
});

export const scheduleRouter = createTRPCRouter({
  // Criar escala única
  createSingle: protectedProcedure
    .input(createSingleScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      const { bandId, date, time, notes, participants, name } = input;

      // Converter string de tempo para DateTime
      let timeDate: Date | null = null;
      if (time) {
        const [hours = 0, minutes = 0] = time.split(":").map(Number);
        timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
      }

      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);

      try {
        const schedule = await ctx.db.schedule.create({
          data: {
            bandId,
            name,
            date: start,
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
        console.error("Erro ao criar escala:", error);
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
        bandId,
        name,
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
      let timeDate: Date | null = null;
      if (time) {
        const [hours = 0, minutes = 0] = time.split(":").map(Number);
        timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
      }

      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);

      try {
        // Criar configuração de recorrência
        const recurrenceConfig = await ctx.db.recurrenceConfig.create({
          data: {
            bandId,
            frequency,
            dayOfWeek,
            weekOfMonth,
            time: timeDate,
            startDate: start,
            endDate: end,
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
          start,
          end,
          dayOfWeek,
          weekOfMonth,
        );

        // Criar todas as escalas
        const schedules = await ctx.db.$transaction(
          scheduleDates.map((date) => {
            const newDate = new Date(date);
            date.setUTCHours(0, 0, 0, 0);

            return ctx.db.schedule.create({
              data: {
                bandId,
                name,
                date: newDate,
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
            });
          }),
        );

        return {
          success: true,
          recurrenceConfig,
          schedulesCreated: schedules.length,
        };
      } catch (error) {
        console.log({ error });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar escalas recorrentes",
        });
      }
    }),

  generateMembersPreview: protectedProcedure
    .input(
      z.object({
        bandId: z.string(),
        formation: z.record(z.string(), z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bandId, formation } = input;

      try {
        const members = await ctx.db.bandMember.findMany({
          where: {
            bandId,
            isActive: true,
          },
          include: { user: { select: { id: true, name: true } } },
        });

        if (!members?.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Nenhum membro encontrado",
          });
        }

        const membersWithRecurrences = await Promise.all(
          members.map(async (member) => {
            const recurrenceCount = await ctx.db.recurrenceParticipant.count({
              where: { participantId: member.userId },
            });
            return {
              ...member,
              recurrenceCount,
            };
          }),
        );

        membersWithRecurrences.sort(
          (a, b) => a.recurrenceCount - b.recurrenceCount,
        );

        const usedUserIds = new Set<string>();
        const preview: {
          id: string;
          userId: string;
          name: string;
          instrument: string;
          placeholder: boolean;
        }[] = [];

        function selectMembersForInstrument(
          instrument: string,
          quantity: number,
        ) {
          const selected: typeof preview = [];
          const candidates = membersWithRecurrences.filter(
            (m) =>
              !usedUserIds.has(m.userId) && m.instruments.includes(instrument),
          );

          for (let i = 0; i < quantity && i < candidates.length; i++) {
            const member = candidates[i];
            selected.push({
              id: member?.id ?? "",
              userId: member?.userId ?? "",
              name: member?.user.name ?? "",
              instrument,
              placeholder: false,
            });
            usedUserIds.add(member?.userId ?? "");
          }

          const placeholdersNeeded = quantity - selected.length;
          for (let i = 0; i < placeholdersNeeded; i++) {
            selected.push({
              id: `placeholder-${instrument}-${i}`,
              userId: `placeholder-${instrument}-${i}`,
              name: "A definir",
              instrument,
              placeholder: true,
            });
          }

          return selected;
        }

        for (const [instrument, quantity] of Object.entries(formation)) {
          const instrumentMembers = selectMembersForInstrument(
            instrument,
            quantity,
          );
          preview.push(...instrumentMembers);
        }

        return preview;
      } catch (error) {
        console.error("Erro ao gerar preview de escala:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar preview de escala",
        });
      }
    }),

  updateSingle: protectedProcedure
    .input(
      createSingleScheduleSchema.extend({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, bandId, name, date, time, notes, participants } = input;

      // Converter hora
      let timeDate: Date | null = null;
      if (time) {
        const [hours = 0, minutes = 0] = time.split(":").map(Number);
        timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
      }

      const existing = await ctx.db.schedule.findUnique({
        where: { id },
        include: {
          participants: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Escala não encontrada",
        });
      }

      const newDate = new Date(date);
      newDate.setUTCHours(0, 0, 0, 0);

      try {
        const existingParticipants = existing.participants;

        const incomingByUser = new Map(
          participants.map((p) => [p.participantId, p]),
        );

        const toCreate = participants.filter(
          (p) =>
            !existingParticipants.some(
              (ep) => ep.participantId === p.participantId,
            ),
        );

        const toUpdate = existingParticipants.filter((ep) => {
          const incoming = incomingByUser.get(ep.participantId);
          return incoming && incoming.instrument !== ep.instrument;
        });

        const toDelete = existingParticipants.filter(
          (ep) => !incomingByUser.has(ep.participantId),
        );

        const updated = await ctx.db.$transaction(async (tx) => {
          await tx.schedule.update({
            where: { id, bandId },
            data: {
              name,
              date: newDate,
              time: timeDate,
              notes,
            },
          });

          for (const participant of toUpdate) {
            const incoming = incomingByUser.get(participant.participantId);
            if (!incoming) continue;
            await tx.scheduleParticipant.update({
              where: {
                scheduleId_participantId: {
                  scheduleId: id,
                  participantId: participant.participantId,
                },
              },
              data: {
                instrument: incoming.instrument,
              },
            });
          }

          if (toCreate.length > 0) {
            await tx.scheduleParticipant.createMany({
              data: toCreate.map((p) => ({
                scheduleId: id,
                participantId: p.participantId,
                instrument: p.instrument,
              })),
              // skipDuplicates: true,
            });
          }

          if (toDelete.length > 0) {
            await tx.scheduleParticipant.deleteMany({
              where: {
                scheduleId: id,
                participantId: {
                  in: toDelete.map((p) => p.participantId),
                },
              },
            });
          }

          return tx.schedule.findUniqueOrThrow({
            where: { id },
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
        });

        return { success: true, schedule: updated };
      } catch (error) {
        console.error("Erro ao editar escala única:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao editar escala única",
        });
      }
    }),
  // Listar escalas
  list: protectedProcedure
    .input(
      z.object({
        bandId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, status, bandId } = input;

      const date: Record<string, Date> = {};
      if (startDate) date.gte = startDate;
      if (endDate) date.lte = endDate;

      const schedules = await ctx.db.schedule.findMany({
        where: {
          bandId,
          ...(Object.keys(date).length ? { date } : {}),
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
        orderBy: [{ date: "asc" }],
      });

      return schedules.map((schedule) => ({
        ...schedule,
        participants: schedule.participants.map(
          ({
            participant,
            instrument,
            confirmed,
            justification,
            notificationSent,
          }) => ({
            ...participant,
            instrument,
            confirmed,
            justification,
            notified: notificationSent,
          }),
        ),
      }));
    }),

  listByMemberId: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { memberId } = input;

      const schedules = await ctx.db.scheduleParticipant.findMany({
        where: {
          participantId: memberId,
        },
        select: {
          id: true,
          instrument: true,
          scheduleId: true,
          confirmed: true,
          justification: true,
          notificationSent: true,
          schedule: {
            select: {
              name: true,
              id: true,
              date: true,
              time: true,
              recurrenceType: true,
              createdBy: { select: { name: true, email: true } },
              recurrenceConfig: true,
              recurrenceGroupId: true,
              status: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              email: true,
              whatsapp: true,
            },
          },
        },
        orderBy: [{ schedule: { date: "asc" } }, { schedule: { time: "asc" } }],
      });

      // return schedules;
      return schedules.map((schedule) => ({
        ...schedule,
        participant: {
          ...schedule.participant,
          notified: schedule.notificationSent,
          justification: schedule.justification,
        },
      }));
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

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const createdById = ctx.session.user.id;
      const schedule = await ctx.db.schedule.findUnique({
        where: { id: input.id, createdById },
        select: { id: true },
      });

      if (!schedule) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Escala não encontrada",
        });
      }

      await ctx.db.$transaction(async (tx) => {
        await tx.schedule.delete({ where: { id: schedule.id } });
      });

      return {
        deleted: true,
      };
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
  const current = new Date(firstDay);

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
