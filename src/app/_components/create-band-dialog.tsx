"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { CirclePlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { setBandInCookie } from "@/lib/utils/getCurrentBandFromCookie";
import { cn } from "@/lib/utils";

type CreateBandDialogProps = {
  label: string;
} & React.ComponentProps<typeof Button>;

export const CreateBandDialog = ({
  label,
  variant = "default",
  size = "lg",
  className,
}: CreateBandDialogProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const { mutateAsync: createBand, isPending: loading } =
    api.band.create.useMutation();
  const utils = api.useUtils();

  const onCreateBand = async () => {
    setError("");
    const toastId = toast.loading("Criando banda/grupo...");

    if (name.length === 0) {
      setError("Campo deve ser preenchido");
      toast.dismiss(toastId);
      return;
    }

    if (name.length < 3) {
      setError("Nome deve conter mínimo 3 caracteres");
      toast.dismiss(toastId);
      return;
    }

    try {
      const band = await createBand({ name });
      if (band) {
        toast.success("Banda criada com sucesso");
        setOpen(false);
        setBandInCookie(band.nickname);

        if (pathname === "/admin/manager") {
          await utils.band.getBands.invalidate();
          return;
        }

        router.push("/admin/manager");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao criar Banda. Tente novamente.";
      setError(message);
      toast.error(message);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          aria-controls="create-band-dialog"
          className={cn(className)}
          size={size}
          disabled={loading}
        >
          <CirclePlus className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent id="create-band-dialog" className="space-y-1 p-4">
        <DialogHeader>
          <DialogTitle>Criar Banda</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Dê um nome para sua Banda/Grupo</Label>
          <Input
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            value={name}
          />
        </div>
        <p className="text-destructive text-sm">{error}</p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button disabled={loading} onClick={onCreateBand}>
            Criar banda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
