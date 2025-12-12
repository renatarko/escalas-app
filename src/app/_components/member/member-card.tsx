"use client";

import { Edit, MoreVertical, Phone, ToggleLeft, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { instrumentOptions } from "@/lib/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useFindCurrentBandId } from "@/lib/hooks/band";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { InstrumentBadge } from "../instrument-badge";
import { Badge } from "../ui/badge";

type ParticipantProps = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  instruments: string[];
  isActive: boolean;
};

export const MemberCard = ({
  id,
  name,
  whatsapp,
  instruments,
  isActive,
}: ParticipantProps) => {
  const { bandId } = useFindCurrentBandId();
  const { membership } = getCurrentMembership();

  const [open, setOpen] = useState({
    active: false,
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
        setOpen({ ...open, active: false });
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

  const isUserAdmin = isAdmin(membership);

  return (
    <>
      <Card className="group animate-slide-up group hover:border-primary/30 p-2 transition-all duration-300">
        <CardContent className="p-2">
          <div className="flex items-start justify-between">
            <Avatar
              member={{
                id,
                name: name ?? "",
                whatsapp: whatsapp ?? "",
                avatar: "",
              }}
              size="sm"
            />
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className={`${isActive ? "bg-primary/10 text-primary" : "bg-muted"}`}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>

              {isUserAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setOpen({ ...open, edit: true })}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setOpen({ ...open, delete: true })}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setOpen({ ...open, active: true })}
                    >
                      <ToggleLeft className="mr-2 h-4 w-4" />
                      {isActive ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="text-foreground font-semibold">{name}</h3>

            {instruments.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Instrumento/Função
                </p>
                <ul className="flex flex-wrap items-center gap-2">
                  {instruments.map((inst) => (
                    <li key={inst}>
                      <InstrumentBadge tooltip instrument={inst} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-primary flex items-center gap-2 text-sm opacity-80 group-hover:opacity-100">
              <Phone className="h-4 w-4" />
              {whatsapp}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={open.edit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Integrante</AlertDialogTitle>
            <AlertDialogDescription>
              Alterar funções do Integrante{" "}
              <span className="text-primary underline">{name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2 grid grid-cols-2 gap-2 sm:my-4">
            {instrumentOptions.map((option) => {
              const isChecked = selected?.includes(option.value);

              return (
                <Label
                  htmlFor={option.value}
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 p-2"
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
              disabled={removeIsLoading}
              className="bg-destructive/90 hover:bg-destructive duration-150"
              onClick={handleRemoveIntegrant}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={open.active}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Desativar" : "Ativar"} Integrante
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? "Esta ação irá desativar o integrante e não poderá ser adicionado em nenhuma escala"
                : "Esta ação irá ativar o integrante e poderá ser adicionado nas escalas"}
              .
              <br />
              Certeza que deseja {isActive ? "desativar" : "ativar"}
              <span className="text-primary ml-1 font-medium underline">
                {name}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen({ ...open, active: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statsIsLoading}
              className="bg-primary/90 hover:bg-primary duration-150"
              onClick={() => handleActiveChange(!isActive)}
            >
              {isActive ? "Desativar" : "Ativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
