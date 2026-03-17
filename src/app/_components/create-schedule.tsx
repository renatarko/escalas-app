"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type z from "zod";
import type { createScheduleFormSchema } from "../form-schemas/schedule";
import ScheduleForm from "./schedule-form";
import { toast } from "sonner";
import { useState } from "react";

type FormData = z.infer<typeof createScheduleFormSchema>;

export const CreateSchedule = () => {
  const { data: session } = useSession();
  const { bandId, participants } = useFindCurrentBandId();
  const { schedule } = api.useUtils();

  const [shouldResetForm, setShouldResetForm] = useState(false);

  const { mutateAsync: createSingleSchedule, isPending: singleIsPending } =
    api.schedule.createSingle.useMutation({
      async onSuccess() {
        toast.success("Escala criada com sucesso!");
        await schedule.list.invalidate();
        setShouldResetForm(true);
      },
    });

  const {
    mutateAsync: createRecurrenceSchedule,
    isPending: recurrenceIsPending,
  } = api.recurrence.create.useMutation({
    async onSuccess() {
      toast.success("Escala criada com sucesso!");
      await schedule.list.invalidate();
      setShouldResetForm(true);
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!session?.user || !bandId) {
      return;
    }
    const toastId = toast.loading("Criando esacala...");
    try {
      const participantsPayload = data.participants
        .filter(
          (participant) =>
            participant.id !== "" && !participant.id.startsWith("placeholder"),
        )
        .map((participant) => ({
          participantId: participant.id,
          instrument: participant.instrument,
        }));

      if (data.recurrenceType === "SINGLE") {
        await createSingleSchedule({
          bandId: bandId,
          name: data.scaleName,
          date: data.date!,
          participants: participantsPayload,
          notes: data.notes,
        });

        return;
      }

      if (data.recurrenceType === "RECURRING") {
        await createRecurrenceSchedule({
          bandId: bandId,
          name: data.scaleName,
          frequency: data.frequency!,
          startDate: data.startDate!,
          endDate: data.endDate!,
          dayOfWeek: data.daysOfWeek ? Number(data.daysOfWeek) : undefined,
          weekOfMonth: data.weekOfMonth ? Number(data.weekOfMonth) : undefined,
          participants: participantsPayload,
          notes: data.notes,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a escala, tente novamente");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <ScheduleForm
      onSubmit={onSubmit}
      participants={participants}
      submitLabel="Criar escala"
      loading={singleIsPending || recurrenceIsPending}
      shouldResetForm={shouldResetForm}
      bandId={bandId ?? ""}
    />
  );
};
