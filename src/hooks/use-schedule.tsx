import { useMemo } from "react";
import { toast } from "sonner";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api, type RouterInputs, type RouterOutputs } from "@/trpc/react";

type ScheduleHook = RouterOutputs["schedule"]["list"][number];
type ScheduleDetail = RouterOutputs["schedule"]["getById"];
type CreateScheduleInput = RouterInputs["schedule"]["createSingle"];
type UpdateScheduleInput = RouterInputs["schedule"]["updateSingle"];

export function useSchedules(filters?: {
  startDate?: Date;
  endDate?: Date;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED";
}) {
  const { bandId } = useFindCurrentBandId();

  const input = useMemo(() => {
    if (!bandId) return null;
    return { bandId, ...filters };
  }, [bandId, filters]);

  return api.schedule.list.useQuery(input as NonNullable<typeof input>, {
    enabled: !!input,
  });
}

export function useSchedule(id?: string) {
  return api.schedule.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id?.length },
  );
}

export function useCreateSchedule() {
  const utils = api.useUtils();

  return api.schedule.createSingle.useMutation({
    onSuccess: async (data) => {
      await utils.schedule.list.invalidate();
      toast.success("Escala criada com sucesso!");
      return data;
    },
    onError: (error) => {
      toast.error(error.message ?? "Erro ao criar escala");
    },
  });
}

export function useUpdateSchedule() {
  const utils = api.useUtils();

  return api.schedule.updateSingle.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.schedule.list.invalidate(),
        utils.schedule.getById.invalidate({ id: data.schedule.id }),
      ]);
      toast.success("Escala atualizada!");
      return data;
    },
    onError: (error) => {
      toast.error(error.message ?? "Erro ao atualizar escala");
    },
  });
}

export function useDeleteSchedule() {
  const utils = api.useUtils();

  return api.schedule.delete.useMutation({
    onSuccess: async () => {
      await utils.schedule.list.invalidate();
      toast.success("Escala excluída!");
    },
    onError: (error) => {
      toast.error(error.message ?? "Erro ao excluir escala");
    },
  });
}

// Helpers to keep consumer types aligned with the TRPC router
export type {
  ScheduleHook,
  ScheduleDetail,
  CreateScheduleInput,
  UpdateScheduleInput,
};
