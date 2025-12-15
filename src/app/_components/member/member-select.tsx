"use client";

import { getCurrentMembership } from "@/lib/hooks/members";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { memberRoleLabel } from "@/lib/constants";
import {
  useAddMembersFromOtherBand,
  useGetAllMembersFromOwnerBand,
} from "@/hooks/use-member";
import { SetInstrument } from "@/lib/utils/setInstrument";
import type { Instrument } from "@/lib/types";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export const MembersDialogSelect = ({ className }: { className?: string }) => {
  const { band } = getCurrentMembership();

  const { members, loading } = useGetAllMembersFromOwnerBand(band?.nickname);
  const addMembers = useAddMembersFromOtherBand();

  const [selected, setSelected] = useState<string[]>([]);

  function toggleMember(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAll(checked: boolean) {
    if (!members) return;

    setSelected(checked ? members.map((m) => m.id) : []);
  }

  const addMembersToBand = async () => {
    if (selected.length === 0)
      return toast.error("Selecione pelo menos um integrante");
    if (!band?.id) return toast.error("Não foi possível adicionar integrantes");
    await addMembers.mutateAsync({
      bandId: band.id,
      bandNickname: band.nickname,
      members: selected,
    });
  };

  useEffect(() => {
    if (addMembers.isSuccess) {
      setSelected([]);
    }
  }, [addMembers.isSuccess]);

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "text-primary hover:bg-muted/50 w-fit rounded-md p-3 text-sm underline duration-150",
          className,
        )}
      >
        Trazer integrante(s) de outra banda
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Integrantes</DialogTitle>
          <DialogDescription>
            Selecione a pessoa que deseja adiocionar na banda
          </DialogDescription>
        </DialogHeader>

        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i + 1}
              className="bg-muted h-8 w-full animate-pulse rounded-md"
            ></div>
          ))}

        {!loading && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selected.length === members?.length && members.length > 0
                    }
                    onCheckedChange={(v) => toggleAll(!!v)}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Instrumeto(s)</TableHead>
                <TableHead>Permissão</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {members?.map((member) => {
                const checked = selected.includes(member.id);

                return (
                  <TableRow
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={cn("cursor-pointer", checked && "bg-muted/50")}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                    </TableCell>

                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="font-medium">
                      {member.instruments.map((is) => (
                        <p key={is}>
                          <span className="mr-1">
                            {SetInstrument(is as Instrument).icon}
                          </span>
                          {SetInstrument(is as Instrument).label}
                        </p>
                      ))}
                    </TableCell>
                    <TableCell className="font-medium">
                      {memberRoleLabel[member.role]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {!loading && (
          <DialogFooter>
            <DialogClose disabled={addMembers.isPending}>Cancelar</DialogClose>
            <Button disabled={addMembers.isPending} onClick={addMembersToBand}>
              {addMembers.isPending ? <Spinner /> : <Plus />}
              Adicionar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
