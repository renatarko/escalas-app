"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type z from "zod";
import type { createScheduleFormSchema } from "../form-schemas/schedule";
import ScheduleForm from "./schedule-form";
import { toast } from "sonner";
import { useMemo } from "react";

type FormData = z.infer<typeof createScheduleFormSchema>;

export const EditSchedule = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const { bandId, participants: allParticipants } = useFindCurrentBandId();

  const { data } = api.schedule.getById.useQuery({ id });

  console.log({ data });

  const { schedule } = api.useUtils();

  const { mutateAsync: updateSingle } = api.schedule.updateSingle.useMutation({
    async onSuccess() {
      toast.success("Escala alterada com sucesso!");
      await schedule.list.invalidate();
    },
  });

  const { mutateAsync: updateRecurrence } = api.recurrence.update.useMutation({
    async onSuccess() {
      toast.success("Escala alterada com sucesso!");
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
        const result = await updateSingle({
          id: id,
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
        const result = await updateRecurrence({
          id,
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

  const defaultValues = useMemo(() => {
    return {
      scaleName: data?.name ?? undefined,
      recurrenceType: data?.recurrenceType,
      frequency: data?.recurrenceConfig?.frequency,
      daysOfWeek: data?.recurrenceConfig?.dayOfWeek
        ? String(data?.recurrenceConfig?.dayOfWeek)
        : undefined,
      weekOfMonth: data?.recurrenceConfig?.weekOfMonth
        ? String(data?.recurrenceConfig?.weekOfMonth)
        : undefined,
      date: data?.date ?? undefined,
      startDate: data?.recurrenceConfig?.startDate ?? undefined,
      endDate: data?.recurrenceConfig?.endDate ?? undefined,
      time: data?.time ? String(data.time) : undefined,
      notes: data?.notes ?? undefined,
      participants: data?.participants.map((part) => ({
        id: part.id,
        name: part.participant.name ?? "",
        instrument: part.instrument,
      })),
    };
  }, [data]);

  const participants =
    allParticipants
      ?.filter(
        (p) =>
          !data?.participants.some(
            (dp) => dp.participant.id === p.id, // exclui os já cadastrados
          ),
      )
      .map((p) => ({
        id: p.id,
        name: p.name ?? "",
        instruments: p.instruments ?? [], // lista de instrumentos disponíveis
      })) ?? [];

  return (
    <ScheduleForm
      onSubmit={onSubmit}
      participants={participants}
      submitLabel="Confirmar alteração"
      defaultValues={defaultValues}
    />
  );
};
