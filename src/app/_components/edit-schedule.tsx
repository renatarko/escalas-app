"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type z from "zod";
import type { createScheduleFormSchema } from "../form-schemas/schedule";
import ScheduleForm from "./schedule-form";
import { toast } from "sonner";
import { useMemo } from "react";
import { RecurrenceType } from "@prisma/client";

type FormData = z.infer<typeof createScheduleFormSchema>;

export const EditSchedule = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const { bandId, participants: allParticipants } = useFindCurrentBandId();

  const { data: scheduleToUpdate } = api.schedule.getById.useQuery({ id });

  const { schedule } = api.useUtils();

  const { mutateAsync: updateSingle, isPending: singleIsLoading } =
    api.schedule.updateSingle.useMutation({
      async onSuccess() {
        toast.success("Escala alterada com sucesso!");
        await schedule.list.invalidate();
      },
    });

  const onSubmit = async (data: FormData) => {
    const toastId = toast.loading("Executando atualização...");
    try {
      if (!session?.user || !bandId) {
        return;
      }

      const participantsPayload = data.participants.map((participant) => ({
        participantId: participant.id,
        instrument: participant.instrument,
      }));

      await updateSingle({
        id: id,
        bandId: bandId,
        name: data.scaleName,
        date: data.date!,
        time: undefined,
        participants: participantsPayload,
        notes: data.notes,
      });
    } catch (error) {
      console.log(error);
      toast.error("Erro ao criar a escala, tente novamente");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const defaultValues = useMemo(() => {
    return {
      scaleName: scheduleToUpdate?.name ?? undefined,
      recurrenceType: RecurrenceType.SINGLE,
      frequency: undefined,
      date: scheduleToUpdate?.date ?? undefined,
      time: scheduleToUpdate?.time ? String(scheduleToUpdate.time) : undefined,
      notes: scheduleToUpdate?.notes ?? undefined,
      participants: scheduleToUpdate?.participants.map((part) => ({
        id: part.participantId,
        name: part.participant.name ?? "",
        instrument: part.instrument,
      })),
    };
  }, [scheduleToUpdate]);

  const participants =
    allParticipants?.map((p) => ({
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
      loading={singleIsLoading}
      isEdit
    />
  );
};
