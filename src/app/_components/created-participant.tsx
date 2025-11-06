"use client";

import { Pencil, Send, Trash } from "lucide-react";
import { Button } from "./ui/button";
import {
  instrumentOptions,
  instrumentsIcons,
  WHATSAPP_BASE_URL,
} from "@/lib/constants";
import type { Instrument } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { Switch } from "./ui/switch";

type ParticipantProps = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  instruments: string[];
  isActive: boolean;
};

export const CreatedParticipant = ({
  id,
  name,
  whatsapp,
  instruments,
  isActive,
}: ParticipantProps) => {
  const { bandId } = useFindCurrentBandId();

  const [open, setOpen] = useState({
    edit: false,
    delete: false,
  });
  const [selected, setSelected] = useState<string[]>(instruments);

  const utils = api.useUtils();
  const { mutateAsync: updateInstruments, isPending: loading } =
    api.bandMember.updateInstruments.useMutation({
      async onSuccess() {
        await utils.bandMember.getBandMembers.invalidate();
        toast.success("Funções alteradas com sucesso");
        setOpen({ ...open, edit: false });
      },
    });

  const { mutateAsync: updateStatus, isPending: statsIsLoading } =
    api.bandMember.updateActiveStats.useMutation({
      async onSuccess(data) {
        await utils.bandMember.getBandMembers.invalidate();
        toast.success(
          data?.isActive
            ? "Integrante ativado com sucesso"
            : "Integrante desativado com sucesso",
        );
      },
    });

  const { mutateAsync: removeIntegrant, isPending: removeIsLoading } =
    api.bandMember.removeMember.useMutation({
      async onSuccess() {
        await utils.bandMember.getBandMembers.invalidate();
        toast.success("Integrante removido");
        setOpen({ ...open, delete: false });
      },
    });

  const handleUpdateInstruments = async () => {
    const toastId = toast.loading("Atualizando...");
    try {
      if (!bandId) return;
      await updateInstruments({ bandId, memberId: id, instruments: selected });
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível alterar as funções");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleRemoveIntegrant = async () => {
    const toastId = toast.loading("Removendo...");
    try {
      if (!bandId) return;
      await removeIntegrant({ bandId, memberId: id });
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível remover Integrante");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleActiveChange = async (checked: boolean) => {
    const toastId = toast.loading(checked ? "Ativando..." : "Desativando...");

    try {
      if (!bandId) return;
      await updateStatus({ bandId, memberId: id, isActive: checked });
    } catch (error) {
      console.log(error);
      toast.error("Não foi atualizar status do Integrante");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div
      key={id}
      className="flex justify-between rounded-lg border p-4 transition-shadow hover:shadow-md sm:items-center"
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <div className="space-y-1">
          <h4 className="font-semibold">{name}</h4>
          <a
            href={`${WHATSAPP_BASE_URL}/55${whatsapp}`}
            target="_blank"
            className="text-muted-foreground flex items-center gap-1 text-sm hover:underline"
          >
            <Send className="size-4 text-green-600" /> {whatsapp}
          </a>
        </div>

        {instruments.length > 0 && (
          <ul className="flex list-none items-center gap-2">
            {instruments.map((func) => (
              <Tooltip key={func}>
                <TooltipTrigger className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                  {instrumentsIcons[func as Instrument]}
                </TooltipTrigger>
                <TooltipContent>
                  {
                    instrumentOptions.find(
                      (instrument) => instrument.value === func,
                    )?.label
                  }
                </TooltipContent>
              </Tooltip>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1 text-center">
          <span className="text-muted-foreground text-xs">
            {isActive ? "Ativo" : "Ativar"}
          </span>
          <Switch
            id={id}
            checked={isActive}
            onCheckedChange={handleActiveChange}
            disabled={statsIsLoading}
          />
        </div>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setOpen({ ...open, edit: true })}
        >
          <Pencil />
        </Button>
        <Button
          size="icon-sm"
          variant="destructive"
          onClick={() => setOpen({ ...open, delete: true })}
        >
          <Trash />
        </Button>
      </div>

      <AlertDialog open={open.edit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Alterar funções do Integrante{" "}
              <span className="text-primary underline">{name}</span>
            </AlertDialogTitle>
            <AlertDialogDescription />
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {instrumentOptions.map((option) => {
              const isChecked = selected?.includes(option.value);

              return (
                <Label
                  htmlFor={option.value}
                  key={option.value}
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    id={option.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelected((stats) => [...stats, option.value]);
                      } else {
                        const filtered = selected.filter(
                          (v) => v !== option.value,
                        );
                        setSelected(filtered);
                      }
                    }}
                  />
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Label>
              );
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen({ ...open, edit: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              onClick={handleUpdateInstruments}
            >
              Atualizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={open.delete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Certeza que deseja remover?</AlertDialogTitle>
            <AlertDialogDescription>
              Atenção! Esta é uma ação irreversível, certeza que deseja remover{" "}
              <span className="text-primary font-medium underline">{name}</span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen({ ...open, delete: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={loading}
              className="bg-destructive/90 hover:bg-destructive duration-150"
              onClick={handleRemoveIntegrant}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
