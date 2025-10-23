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

export const CreateBandDialog = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { mutateAsync: createBand } = api.band.create.useMutation();

  const onCreateBand = async () => {
    setError("");
    setLoading(true);
    const toastId = toast.loading("Criando banda/grupo...");

    if (!name) {
      setError("Campo deve ser preenchido");
      return;
    }

    if (name.length < 3) {
      setError("Nome deve conter mínimo 3 caracteres");
      return;
    }

    try {
      const band = await createBand({ name });
      if (band) {
        toast.success("Banda criada com sucesso");
        setOpen(false);
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
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-controls="create-band-dialog">Criar Banda</Button>
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
