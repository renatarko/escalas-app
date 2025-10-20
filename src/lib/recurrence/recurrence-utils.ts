import {
  addWeeks,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isAfter,
} from "date-fns";

interface RecurrenceParams {
  frequency: "WEEKLY" | "MONTHLY";
  dayOfWeek?: number; // 0=Dom, 1=Seg, ..., 6=Sáb
  weekOfMonth?: number; // 1=primeira, 2=segunda, 3=terceira, 4=quarta, -1=última
  startDate: Date;
  endDate: Date;
}

export function generateRecurringSchedules(params: RecurrenceParams): Date[] {
  const dates: Date[] = [];
  const { frequency, dayOfWeek, weekOfMonth, startDate, endDate } = params;

  if (frequency === "WEEKLY") {
    // Gerar escalas semanais
    let currentDate = new Date(startDate);

    // Ajustar para o dia da semana correto
    while (getDay(currentDate) !== dayOfWeek) {
      currentDate = addWeeks(currentDate, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (
      isBefore(currentDate, endDate) ||
      currentDate.getTime() === endDate.getTime()
    ) {
      dates.push(new Date(currentDate));
      currentDate = addWeeks(currentDate, 1);
    }
  } else if (frequency === "MONTHLY") {
    // Gerar escalas mensais
    let currentDate = new Date(startDate);

    while (
      isBefore(currentDate, endDate) ||
      currentDate.getTime() === endDate.getTime()
    ) {
      const targetDate = getNthWeekdayOfMonth(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        dayOfWeek!,
        weekOfMonth!,
      );

      if (
        targetDate &&
        !isBefore(targetDate, startDate) &&
        !isAfter(targetDate, endDate)
      ) {
        dates.push(targetDate);
      }

      currentDate = addMonths(currentDate, 1);
    }
  }

  return dates;
}

// Função auxiliar para encontrar o N-ésimo dia da semana em um mês
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekOfMonth: number,
): Date | null {
  const firstDay = startOfMonth(new Date(year, month));
  const lastDay = endOfMonth(new Date(year, month));

  const allDays = eachDayOfInterval({ start: firstDay, end: lastDay });
  const matchingDays = allDays.filter((day) => getDay(day) === dayOfWeek);

  if (weekOfMonth === -1) {
    // Última ocorrência
    return matchingDays[matchingDays.length - 1] || null;
  } else if (weekOfMonth >= 1 && weekOfMonth <= matchingDays.length) {
    // N-ésima ocorrência (1-indexed)
    return matchingDays[weekOfMonth - 1] || null;
  }

  return null;
}

// Função para descrever a recorrência em português
export function describeRecurrence(config: {
  frequency: "WEEKLY" | "MONTHLY";
  dayOfWeek?: number;
  weekOfMonth?: number;
}): string {
  const daysOfWeek = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const weekOrdinals = ["primeira", "segunda", "terceira", "quarta"];

  if (config.frequency === "WEEKLY") {
    return `Toda ${daysOfWeek[config.dayOfWeek!]}`;
  } else {
    const ordinal =
      config.weekOfMonth === -1
        ? "última"
        : weekOrdinals[config.weekOfMonth! - 1];
    return `Toda ${ordinal} ${daysOfWeek[config.dayOfWeek!]} do mês`;
  }
}
