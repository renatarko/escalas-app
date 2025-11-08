"use client";

import {
  instrumentOptions,
  instrumentsIcons,
  invitationStatusLabel,
  memberRoleLabel,
} from "@/lib/constants";
import type { BandRole, InvitationStatus } from "@prisma/client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { EllipsisVertical, Pencil, Send, Trash } from "lucide-react";
import { AlertCustom } from "./custom-alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import type { Instrument } from "@/lib/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useCurrentMember } from "@/lib/hooks/members";

type MenuOptionsProps = {
  invite: {
    id: string;
    status: InvitationStatus;
  };
};

const MenuOptions = ({ invite }: MenuOptionsProps) => {
  const { id, status } = invite;

  const utils = api.useUtils().invitation;

  const [modals, setModals] = useState({ delete: false });

  const { mutateAsync: deleteInvitation, isPending: loading } =
    api.invitation.delete.useMutation({
      async onSuccess() {
        toast.success("Convite excluído com sucesso");
        await utils.getInvitations.invalidate();
      },
    });

  const handleDelete = async () => {
    const toastId = toast.loading("Deletando Convite...");
    try {
      await deleteInvitation({ id });
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível excluir Convite");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="icon-sm" variant="outline">
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>
            <Pencil />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <Send />
            Reenviar
          </DropdownMenuItem>

          {["PENDING", "EXPIRED", "DECLINED"].includes(status) && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setModals({ delete: true })}
            >
              <Trash />
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertCustom
        open={modals.delete}
        setOpen={(value) => setModals({ delete: value })}
        handleConfirm={handleDelete}
        disabled={loading}
      />
    </>
  );
};

type InviteCardProps = {
  invitation: {
    id: string;
    email: string;
    role: BandRole | null;
    instruments: string[];
    status: InvitationStatus;
  };
};

export const InviteCard = ({ invitation }: InviteCardProps) => {
  const member = useCurrentMember();

  const setBackgroundColorByStatus = (status: InvitationStatus) => {
    if (status === "CANCELLED") return "bg-destructive";
    if (status === "DECLINED") return "bg-destructive";
    if (status === "EXPIRED") return "bg-orange-500";
    if (status === "PENDING") return "bg-yellow-600";
  };

  return (
    <div
      key={invitation.email}
      className="bg-muted/60 flex items-center justify-between p-4"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:gap-16">
        <div className="space-y-1">
          <p className="text-sm">{invitation.email}</p>
          <p className="text-muted-foreground text-xs">
            {invitation.role && memberRoleLabel[invitation.role]}
          </p>
        </div>

        {invitation.instruments.length > 0 && (
          <div className="sm:text-center">
            <p className="text-muted-foreground text-xs font-medium">Funções</p>
            <ul className="flex list-none items-center gap-2">
              {invitation.instruments.map((func) => (
                <li key={func}>
                  <Tooltip>
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="text- flex items-center space-x-1">
        <Badge className={setBackgroundColorByStatus(invitation.status)}>
          {invitationStatusLabel[invitation.status]}
        </Badge>

        {member &&
          member.role !== "MEMBER" &&
          invitation.status !== "ACCEPTED" && (
            <MenuOptions invite={invitation} />
          )}
      </div>
    </div>
  );
};
