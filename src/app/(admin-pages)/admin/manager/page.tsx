"use client";

import { Button } from "@/app/_components/ui/button";
import { api } from "@/trpc/react";
import {
  PlusCircle,
  Music2,
  CalendarDays,
  Settings,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const { data: bands, isPending } = api.band.getBands.useQuery();

  return (
    <div className="pt-8">
      <section className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold">
          Bem-vindo de volta, <span className="text-teal-700">músico!</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Gerencie suas bandas, integrantes e escalas de forma prática.
        </p>
      </section>

      <section className="mb-16 flex justify-center gap-4">
        <Link href="/bands/new">
          <Button className="bg-teal-700 text-white hover:bg-teal-800">
            <PlusCircle className="mr-2 h-5 w-5" />
            Nova Banda
          </Button>
        </Link>
        <Link href="/schedules/new">
          <Button variant="outline">
            <CalendarDays className="mr-2 h-5 w-5" />
            Criar Escala
          </Button>
        </Link>
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
                  <Link href={`/bands/${band.id}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" /> Gerenciar
                    </Button>
                  </Link>
                  <Link href={`/bands/${band.id}/schedules`}>
                    <Button
                      size="sm"
                      className="bg-teal-700 text-white hover:bg-teal-800"
                    >
                      Escalas <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
