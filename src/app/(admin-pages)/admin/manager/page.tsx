"use client";

import { CreateBandDialog } from "@/app/_components/create-band-dialog";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Spinner } from "@/app/_components/ui/spinner";
import { Unauthorized } from "@/app/_components/unauthorized";
import { memberRoleLabel } from "@/lib/constants";
import { getCurrentMembership } from "@/lib/hooks/members";
import { cn } from "@/lib/utils";
import {
  getCurrentBandFromCookie,
  setBandInCookie,
} from "@/lib/utils/getCurrentBandFromCookie";
import { api } from "@/trpc/react";
import { Music2, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function DashboardHome() {
  const { membership, isLoading } = getCurrentMembership();
  const { data: bands, isPending } = api.band.getBands.useQuery();

  const currentBand = getCurrentBandFromCookie();
  const [redirecting, setRedirecting] = useState<string | null>(null);

  const handleBandChange = (nickname: string) => {
    setRedirecting(nickname);
    setBandInCookie(nickname);
    redirect("/admin/escalas");
  };

  if (isLoading || isPending) {
    return (
      <div className="mt-36 flex w-full flex-col items-center justify-center gap-4">
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <div className="bg-primary/70 h-3 w-3 animate-bounce rounded-full [animation-delay:-0.3s]" />
            <div className="bg-primary/80 h-3 w-3 animate-bounce rounded-full [animation-delay:-0.15s]" />
            <div className="bg-primary h-3 w-3 animate-bounce rounded-full" />
          </div>
        </div>
        <h2 className="animate-pulse text-center">
          Aguarde, estamos preparando seu ambiente...
        </h2>
      </div>
    );
  }

  if (!membership || membership.role === "MEMBER") {
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

      {/* Lista de Bandas */}
      <section className="sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
            <Music2 className="text-primary h-5 w-5" />
            Minhas Bandas
          </h2>

          <CreateBandDialog label="Nova Banda" />
        </div>

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
                className={cn(
                  "bg-card border-muted flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition hover:shadow-md",
                  currentBand === band.nickname &&
                    "border-primary/80 border shadow-md",
                )}
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
                    {redirecting && redirecting === band.nickname ? (
                      <Spinner className="mr-2 h-4 w-4" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
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
    </div>
  );
}
