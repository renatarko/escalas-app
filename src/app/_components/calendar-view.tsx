import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";

import { parse, startOfWeek, getDay, format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { CardSchedule } from "./card-schedule";
import type { RecurrenceType, ScheduleStatus } from "@prisma/client";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Participant = {
  participant: {
    id: string;
    name: string | null;
    whatsapp: string | null;
  };
  instrument: string;
  confirmed: boolean | null;
};

type Schedule = {
  id: string;
  status: ScheduleStatus;
  title: string | null;
  name: string | null;
  start: Date;
  end: Date;
  date: Date;
  recurrenceType: RecurrenceType;
  createdBy: { name: string | null };
  participants: Participant[];
};

export const CalendarView = ({ schedules }: { schedules: Schedule[] }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  const handleEventClick = (schedule: Schedule) => {
    setOpen(true);
    setSelectedEvent(schedule);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="h-screen">
      <Calendar
        localizer={localizer}
        date={date}
        events={schedules}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"
        views={["month", "agenda"]}
        onSelectEvent={handleEventClick}
        popup
        onNavigate={handleNavigate}
        onView={handleViewChange}
        view={view}
        messages={{
          today: "Hoje",
          previous: "<",
          next: ">",
          month: "Mês",
          week: "Semana",
          day: "Dia",
          agenda: "Agenda",
          date: "Data",
          time: "Hora",
          event: "Escala",
          showMore: (total) => `+ Mais ${total}`,
          tomorrow: "Amanhã",
          yesterday: "Ontem",
          noEventsInRange: "Não há eventos neste período.",
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle> Detalhes da Escala</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          {selectedEvent && <CardSchedule schedule={selectedEvent} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};
