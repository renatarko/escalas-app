import { useMemo } from "react";
import { toast } from "sonner";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api, type RouterInputs, type RouterOutputs } from "@/trpc/react";

export function useUpdateMemberRole() {
  const utils = api.useUtils();

  return api.bandMember.updateMember.useMutation({
    async onSuccess() {
      await utils.bandMember.getBandMembers.invalidate();
      toast.success("Função alterada com sucesso");
    },
    onError(error) {
      toast.error(error.message ?? "Erro ao atualizar integrante");
    },
  });
}

export function useUpdateMemberInstrument() {
  const utils = api.useUtils();

  return api.bandMember.updateInstruments.useMutation({
    async onSuccess() {
      await utils.bandMember.getBandMembers.invalidate();
      toast.success("Funções alteradas com sucesso");
    },
    onError(error) {
      toast.error(error.message ?? "Erro ao atualizar integrante");
    },
  });
}

export function useUpdateActiveStats() {
  const utils = api.useUtils();

  return api.bandMember.updateActiveStats.useMutation({
    async onSuccess(data) {
      await utils.bandMember.getBandMembers.invalidate();
      toast.success(
        data?.isActive
          ? "Integrante ativado com sucesso"
          : "Integrante desativado com sucesso",
      );
    },
    onError(error) {
      toast.error(error.message ?? "Erro ao atualizar integrante");
    },
  });
}

export function useRemoveMember() {
  const utils = api.useUtils();

  return api.bandMember.removeMember.useMutation({
    async onSuccess() {
      await utils.bandMember.getBandMembers.invalidate();
      toast.success("Integrante removido");
    },
    onError(error) {
      toast.error(error.message ?? "Erro ao remover integrante");
    },
  });
}
