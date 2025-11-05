"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type z from "zod";
import type { createScheduleFormSchema } from "../form-schemas/schedule";
import ScheduleForm from "./schedule-form";
import { toast } from "sonner";

type FormData = z.infer<typeof createScheduleFormSchema>;

export const CreateSchedule = () => {
  const { data: session } = useSession();
  const { bandId, participants } = useFindCurrentBandId();

  const { schedule } = api.useUtils();

  const { mutateAsync: createSingleSchedule } =
    api.schedule.createSingle.useMutation({
      async onSuccess() {
        toast.success("Escala criada com sucesso!");
        await schedule.list.invalidate();
      },
    });

  const { mutateAsync: createRecurrenceSchedule } =
    api.recurrence.create.useMutation({
      async onSuccess() {
        toast.success("Escala criada com sucesso!");
        await schedule.list.invalidate();
      },
    });

  const onSubmit = async (data: FormData) => {
    console.log({ data });

    try {
      if (!session?.user || !bandId) {
        return;
      }

      const participantsPayload = data.participants.map((participant) => ({
        participantId: participant.id,
        instrument: participant.instrument,
      }));

      if (data.recurrenceType === "SINGLE") {
        const result = await createSingleSchedule({
          bandId: bandId,
          name: data.scaleName,
          date: data.date!,
          time: data.time,
          participants: participantsPayload,
          notes: data.notes,
        });

        if (result.success) {
          console.log("Schedule created:", result);
        }

        return;
      }

      if (data.recurrenceType === "RECURRING") {
        const result = await createRecurrenceSchedule({
          bandId: bandId,
          name: data.scaleName,
          frequency: data.frequency!,
          startDate: data.startDate!,
          endDate: data.endDate!,
          time: data.time,
          dayOfWeek: data.daysOfWeek ? Number(data.daysOfWeek) : undefined,
          weekOfMonth: data.weekOfMonth ? Number(data.weekOfMonth) : undefined,
          participants: participantsPayload,
          notes: data.notes,
        });

        if (result) {
          console.log("Schedule created:", result);
        }

        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a escala, tente novamente");
    }
  };

  return (
    <ScheduleForm
      onSubmit={onSubmit}
      participants={participants}
      submitLabel="Criar escala"
    />
  );
};
