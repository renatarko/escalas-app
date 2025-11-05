import z from "zod";

export const participantRowSchema = z.object({
  id: z.string().min(1, "Selecione um participante"),
  instrument: z.string().min(1, "Selecione uma função"),
});

export const createScheduleFormSchema = z
  .object({
    scaleName: z.string().min(2, {
      message: "Dê um nome para a escala",
    }),
    recurrenceType: z.enum(["SINGLE", "RECURRING"], {
      required_error: "Selecione uma opção",
    }),
    frequency: z
      .enum(["DAILY", "WEEKLY", "MONTHLY"], {
        required_error: "Selecione uma opção",
      })
      .optional(),
    daysOfWeek: z.string().optional(),
    weekOfMonth: z.string().optional(),
    date: z.date().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    time: z.string().optional(),
    notes: z.string().optional(),
    participants: z
      .array(participantRowSchema)
      .min(1, "Adicione pelo menos um participante")
      .refine(
        (participants) => {
          // Verifica se não há participantes duplicados
          const participantIds = participants.map((p) => p.id);
          const uniqueNames = new Set(participantIds);
          return participantIds.length === uniqueNames.size;
        },
        {
          message:
            "Não é permitido adicionar o mesmo participante mais de uma vez",
        },
      ),
  })
  .superRefine((data, ctx) => {
    const {
      recurrenceType,
      frequency,
      startDate,
      weekOfMonth,
      daysOfWeek,
      endDate,
      date,
      time,
    } = data;

    if (recurrenceType === "SINGLE") {
      if (!date) {
        ctx.addIssue({
          code: "custom",
          message: "Informe uma data",
          path: ["date"],
        });
      }
      if (!time) {
        ctx.addIssue({
          code: "custom",
          message: "Informe um horário",
          path: ["time"],
        });
      }
      return;
    }

    if (recurrenceType === "RECURRING") {
      if (!frequency) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione a frequência da escala",
          path: ["frequency"],
        });
      }
      if (!frequency || (frequency === "WEEKLY" && !daysOfWeek)) {
        ctx.addIssue({
          code: "custom",
          message: "Selecione um dia da semana",
          path: ["daysOfWeek"],
        });
      }
      if (!frequency || frequency === "MONTHLY") {
        if (!daysOfWeek) {
          ctx.addIssue({
            code: "custom",
            message: "Selecione um dia da semana",
            path: ["daysOfWeek"],
          });
        }
        if (!weekOfMonth) {
          ctx.addIssue({
            code: "custom",
            message: "Selecione uma semana do mês",
            path: ["weekOfMonth"],
          });
        }
      }

      if (
        frequency === "DAILY" ||
        frequency === "MONTHLY" ||
        frequency === "WEEKLY"
      ) {
        if (!startDate) {
          ctx.addIssue({
            code: "custom",
            message: "Informe uma data inicial",
            path: ["startDate"],
          });
        }
        if (!endDate) {
          ctx.addIssue({
            code: "custom",
            message: "Informe uma data final",
            path: ["endDate"],
          });
        }

        // Valida intervalo de tempo
        if (startDate && endDate && endDate <= startDate) {
          ctx.addIssue({
            code: "custom",
            message: "A data final deve ser posterior à data inicial",
            path: ["endDate"],
          });
        }
      }
    }
  });
