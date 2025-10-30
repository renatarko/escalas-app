"use client";

import { setBandInCookie } from "@/lib/utils/getCurrentBandFromCookie";
import { Calendar, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Spinner } from "./ui/spinner";
import { useSession } from "next-auth/react";

type BandsProps = {
  bands: {
    nickname: string;
    name: string;
    members: any[];
    schedules: any[];
  }[];
};

export const Bands = ({ bands }: BandsProps) => {
  const [redirecting, setRedirecting] = useState(false);

  const handleBandChange = (nickname: string) => {
    setBandInCookie(nickname);
    setRedirecting(true);
    redirect("/admin");
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold">Meus Grupos/Bandas</h3>
      <p className="text-muted-foreground">
        Clique na banda que deseja gerenciar{" "}
      </p>

      <div className="mt-4 grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
        {bands.length === 0 ? (
          <p className="col-span-full">
            Você ainda não possui uma banda, crie uma agora e comece a gerenciar
            suas escalas.
          </p>
        ) : (
          bands.map((band) => (
            <div
              key={band.nickname}
              onClick={() => handleBandChange(band.nickname)}
              className="bg-muted/70 hover:bg-muted cursor-pointer space-y-2 rounded-lg border p-4 shadow duration-150 hover:shadow-lg"
            >
              <p className="text-lg font-bold">{band.name}</p>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs">
                    Integrantes
                  </span>
                  <p className="flex items-center gap-2 font-bold">
                    <Users className="size-4" />
                    {band.members.length}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs">
                    Escalas criadas
                  </span>
                  <p className="flex items-center gap-2 font-bold">
                    <Calendar className="size-4" />
                    {band.schedules.length}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={redirecting}>
        <DialogTrigger />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carregando Banda</DialogTitle>
            <DialogDescription>
              Aguarde, estamos carregando os dados da sua Banda...
            </DialogDescription>
          </DialogHeader>
          <div className="flex w-full items-center justify-center">
            <Spinner className="size-8" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
