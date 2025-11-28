"use client";

import { CreateBandDialog } from "@/app/_components/create-band-dialog";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Spinner } from "@/app/_components/ui/spinner";
import { Unauthorized } from "@/app/_components/unauthorized";
import { useAbility } from "@/lib/auth/hooks/useAbility";
import { memberRoleLabel } from "@/lib/constants";
import { getCurrentMembership } from "@/lib/hooks/members";
import {
  getCurrentBandFromCookie,
  setBandInCookie,
} from "@/lib/utils/getCurrentBandFromCookie";
import { useTabsStore } from "@/stores/use-tabs-store";
import { api } from "@/trpc/react";
import { Music2, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const { membership } = getCurrentMembership();
  const { data: bands, isPending } = api.band.getBands.useQuery();

  const currentNickname = getCurrentBandFromCookie();
  const { setTab } = useTabsStore();

  const [redirecting, setRedirecting] = useState(false);
  const [nickname, setNickname] = useState("");

  const handleBandChange = (nickname: string) => {
    setNickname(nickname);
    setBandInCookie(nickname);
    setTab("scales");
    setRedirecting(true);
  };

  useEffect(() => {
    if (redirecting) {
      if (currentNickname === nickname) {
        setTimeout(() => {
          redirect("/admin");
        }, 1000);
      }
    }
  }, [redirecting, nickname, currentNickname]);

  const ability = useAbility();

  if (!ability.can("manage", "User")) {
    return <Unauthorized />;
  }

  return (
    <div className="sm:pt-8">
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-xl font-bold sm:text-4xl">
          Bem-vindo de volta, <span className="text-teal-700">músico!</span>
        </h1>
        <p className="text-muted-foreground text-md sm:text-lg">
          Gerencie suas bandas, integrantes e escalas de forma prática.
        </p>
      </section>

      <section className="mb-16 flex justify-center gap-4">
        <CreateBandDialog label="Nova Banda" />
      </section>

      {/* Lista de Bandas */}
      <section className="sm:px-6">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <Music2 className="h-5 w-5 text-teal-600" />
          Minhas Bandas
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isPending &&
            Array.from({ length: 3 }).map((item, i) => (
              <div
                key={i + 1}
                className="h-36 w-full animate-pulse rounded-lg border bg-gray-200 p-16"
              />
            ))}

          {!!bands &&
            bands.map((band) => (
              <div
                key={band.id}
                className="bg-card border-muted flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <h3 className="mb-1 text-lg font-semibold">{band.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {band.members.length} integrante
                    {band.members.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBandChange(band.nickname)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {membership && membership.role !== "MEMBER"
                      ? "Gerenciar"
                      : "Ver detalhes"}
                  </Button>

                  {!!membership && (
                    <Badge variant="secondary">
                      {
                        memberRoleLabel[
                          band.members.find(
                            (member) => member.userId === membership?.id,
                          )?.role ?? "ADMIN"
                        ]
                      }
                    </Badge>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>

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
}
