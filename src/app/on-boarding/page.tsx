"use client";

import {
  Music,
  PlusCircle,
  CalendarDays,
  Users2,
  Calendar,
  CirclePlus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../_components/ui/button";
import { CardInfo } from "../_components/ui/card-info";

export default function EmptyBandsPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 pt-32 pb-12">
      <section className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-teal-100 opacity-40 blur-3xl" />
          <div className="relative rounded-full border border-slate-200 bg-white p-4 shadow-md">
            <Music className="size-10 text-teal-700" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold md:text-4xl">
          Bem-vindo ao <span className="text-teal-700">Escalas App</span>!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl text-base md:text-lg">
          Para começar, crie sua primeira <strong>banda</strong> e gerencie
          facilmente suas escalas e participantes.
        </p>

        <Link href="/bands/new">
          <Button
            size="lg"
            className="bg-teal-700 px-8 text-white hover:bg-teal-800"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Criar minha primeira banda
          </Button>
        </Link>
      </section>

      <section className="mt-24 space-y-4 text-center">
        <h2 className="mb-3 flex items-center justify-center gap-2 text-2xl font-semibold">
          <CalendarDays className="h-5 w-5 text-teal-600" />
          Como funciona?
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <CardInfo
            icon={CirclePlus}
            title="Crie uma banda"
            description="Dê um nome à sua banda e adicione os membros que farão parte das escalas."
          />

          <CardInfo
            icon={Users2}
            title="Adicione participantes"
            description="Cadastre vocalistas, músicos e técnicos — todos em um só lugar."
          />

          <CardInfo
            icon={Calendar}
            title="Monte as escalas"
            description="Crie escalas automáticas e mantenha todos sincronizados com facilidade."
          />
        </div>
      </section>
    </main>
  );
}
