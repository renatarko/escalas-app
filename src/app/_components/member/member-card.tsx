"use client";

import {
  Guitar,
  MoreVertical,
  Phone,
  ToggleLeft,
  Trash2,
  UserRoundCog,
} from "lucide-react";
import { Button } from "../ui/button";
import { instrumentOptions, memberRoleLabel } from "@/lib/constants";
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
import { toast } from "sonner";
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
import { BandRole } from "@prisma/client";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  useRemoveMember,
  useUpdateActiveStats,
  useUpdateMemberInstrument,
  useUpdateMemberRole,
} from "@/hooks/use-member";

const bandMemberRoles = [
  {
    label: "Proprietário",
    value: BandRole.OWNER,
    description:
      "O proprietário poderá criar, editar e excluir escalas, convidar, editar e remover integrantes e enviar notificações para os integrantes da escala",
  },
  {
    label: "Admistrador",
    value: BandRole.ADMIN,
    description:
      "O administrador poderá criar e editar escalas, convidar e editar integrantes e enviar notificações para os integrantes da escala",
  },
  {
    label: "Integrante",
    value: BandRole.MEMBER,
    description:
      "O integrante só poderá visualizar sua escalas e poderá ser escalado para qualquer escala dentro do seu grupo/banda",
  },
];

type ParticipantProps = {
  id: string;
  name: string | null;
  whatsapp: string | null;
  instruments: string[];
  isActive: boolean;
  role: BandRole;
};

export const MemberCard = ({
  id,
  name,
  whatsapp,
  instruments,
  isActive,
  role,
}: ParticipantProps) => {
  const { membership, band } = getCurrentMembership();

  const [open, setOpen] = useState({
    active: false,
    edit: false,
    editRole: false,
    delete: false,
  });

  const [selected, setSelected] = useState<string[]>(instruments);
  const [selectedRole, setSelectedRole] = useState<BandRole | null>(role);

  const updateMemberRole = useUpdateMemberRole();
  const updateInstruments = useUpdateMemberInstrument();
  const updateActiveStats = useUpdateActiveStats();
  const removeIntegrant = useRemoveMember();

  const handleUpdateMemberBandRole = async () => {
    const toastId = toast.loading("Atualizando...");
    try {
      if (!id || !selectedRole || !band) return;
      await updateMemberRole.mutateAsync({
        bandNickname: band.nickname,
        memberId: id,
        role: selectedRole,
      });
      setOpen({ ...open, editRole: false });
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível alterar as funções");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleUpdateInstruments = async () => {
    const toastId = toast.loading("Atualizando...");
    try {
      if (!band) return;
      await updateInstruments.mutateAsync({
        bandId: band.id,
        memberId: id,
        instruments: selected,
      });
      setOpen({ ...open, edit: false });
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
      if (!band) return;
      await removeIntegrant.mutateAsync({ bandId: band.id, memberId: id });
      setOpen({ ...open, delete: false });
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
      if (!band) return;
      await updateActiveStats.mutateAsync({
        bandId: band.id,
        memberId: id,
        isActive: checked,
      });
      setOpen({ ...open, delete: false });
    } catch (error) {
      console.log(error);
      toast.error("Não foi atualizar status do Integrante");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const isUserAdmin = isAdmin(membership);

  const memberRoleColor = {
    OWNER: "default",
    ADMIN: "secondary",
    MEMBER: "outline",
  };

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
                variant={"secondary"}
                className={`${isActive ? "bg-primary/10 text-primary" : "bg-muted"}`}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>

              <Badge variant={memberRoleColor[role]}>
                {memberRoleLabel[role]}
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
                      <Guitar className="mr-1 h-4 w-4" />
                      Editar intrumento
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setOpen({ ...open, editRole: true })}
                    >
                      <UserRoundCog className="mr-1 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setOpen({ ...open, delete: true })}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
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

      <AlertDialog open={open.editRole}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Editar Integrante</AlertDialogTitle>
            <AlertDialogDescription>
              Alterar funções do Integrante{" "}
              <span className="text-primary underline">{name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <RadioGroup
            className="space-y-2"
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            {bandMemberRoles.map((option) => {
              return (
                <div key={option.value} className="space-y-2">
                  <Label
                    className="flex cursor-pointer items-center gap-2 font-medium"
                    htmlFor={option.value}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    {option.label}
                  </Label>

                  <p className="bg-primary/10 rounded-md p-1 text-xs">
                    {option.description}
                  </p>
                </div>
              );
            })}
          </RadioGroup>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setOpen({ ...open, editRole: false })}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={role === selectedRole || updateMemberRole.isPending}
              onClick={handleUpdateMemberBandRole}
            >
              Alterar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              disabled={updateInstruments.isPending}
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
              disabled={removeIntegrant.isPending}
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
              disabled={updateActiveStats.isPending}
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
