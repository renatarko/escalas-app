import { createEvents, type EventAttributes } from "ics";

type Schedule = {
  id: string;
  name: string;
  date: Date;
  time?: Date;
  notes?: string | null;
  status: string;
  recurrenceType: string;
  recurrenceGroupId?: string | null;
  createdBy?: {
    name?: string | null;
    email?: string | null;
  };
  participants?: Array<{
    participant: {
      name?: string | null;
      email?: string | null;
    };
  }>;
  recurrenceConfig?: {
    frequency: string;
    dayOfWeek?: number;
    weekOfMonth?: number;
    startDate: Date;
    endDate?: Date | null;
  } | null;
};

const getDayCode = (dayOfWeek: number): string => {
  const days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return days[dayOfWeek] ?? "SU";
};

const generateRecurrenceRule = (
  config: NonNullable<Schedule["recurrenceConfig"]>,
): string => {
  const { frequency, weekOfMonth, dayOfWeek, endDate } = config;

  let rule = `FREQ=${frequency}`;

  // Para recorrência mensal: "2º Domingo do mês"
  if (frequency === "MONTHLY" && weekOfMonth && dayOfWeek !== undefined) {
    rule += `;BYDAY=${weekOfMonth}${getDayCode(dayOfWeek)}`;
  }

  // Adiciona data de término se existir
  if (endDate) {
    const until =
      endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    rule += `;UNTIL=${until}`;
  }

  return rule;
};

export const exportToCalendar = (schedules: Schedule[], filename?: string) => {
  // Agrupa eventos recorrentes pelo recurrenceGroupId
  const groupedSchedules = new Map<string, Schedule>();

  schedules.forEach((schedule) => {
    if (schedule.recurrenceType === "RECURRING" && schedule.recurrenceGroupId) {
      // Para recorrentes, usa apenas a primeira ocorrência
      if (!groupedSchedules.has(schedule.recurrenceGroupId)) {
        groupedSchedules.set(schedule.recurrenceGroupId, schedule);
      }
    } else {
      // Eventos únicos
      groupedSchedules.set(schedule.id, schedule);
    }
  });

  // Converte para formato ics
  const events: EventAttributes[] = Array.from(groupedSchedules.values()).map(
    (schedule) => {
      const startDate = new Date(schedule.date);
      const time = schedule.time ? new Date(schedule.time) : null;

      // Se tem horário específico, usa ele
      if (time) {
        startDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
      }

      const event: EventAttributes = {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes(),
        ],
        duration: { hours: 2 }, // Duração padrão de 2 horas
        title: schedule.name,
        description: schedule.notes ?? undefined,
        status: schedule.status === "CONFIRMED" ? "CONFIRMED" : "TENTATIVE",
        busyStatus: "BUSY",
        uid: schedule.id,
      };

      // Adiciona organizador se existir
      if (schedule.createdBy?.name) {
        event.organizer = {
          name: schedule.createdBy.name,
          email: schedule.createdBy.email ?? undefined,
        };
      }

      // Adiciona participantes
      if (schedule.participants && schedule.participants.length > 0) {
        event.attendees = schedule.participants.map((p) => ({
          name: p.participant.name ?? "",
          email: p.participant.email ?? undefined,
          rsvp: true,
          role: "REQ-PARTICIPANT",
        }));
      }

      // Adiciona regra de recorrência se for evento recorrente
      if (
        schedule.recurrenceType === "RECURRING" &&
        schedule.recurrenceConfig
      ) {
        event.recurrenceRule = generateRecurrenceRule(
          schedule.recurrenceConfig,
        );
      }

      return event;
    },
  );

  // Gera o arquivo .ics
  createEvents(events, (error, value) => {
    if (error) {
      console.error("Erro ao criar eventos:", error);
      alert("Erro ao exportar calendário. Tente novamente.");
      return;
    }

    // Cria o blob e faz o download
    const blob = new Blob([value], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download =
      filename ?? `escalas-${new Date().toISOString().split("T")[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
};
