import { HydrateClient } from "@/trpc/server";
import { ArrowRight, CalendarDays, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./_components/ui/button";
import { CardInfo } from "./_components/ui/card-info";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 pt-28 pb-12">
        <section className="space-y-8 px-6 pt-16 pb-10 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-extrabold">
              Organize suas <span className="text-teal-700">escalas</span> com
              facilidade
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie bandas, integrantes e escalas de forma automática e sem
              complicações.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-teal-700 px-8 text-white hover:bg-teal-800"
              >
                Criar Conta
              </Button>
            </Link>
            <Link href="/sing-in">
              <Button size="lg" variant="outline" className="px-10">
                Entrar
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 px-6 py-8 pb-16 md:grid-cols-3">
          <CardInfo
            icon={CalendarDays}
            title="Crie Escalas"
            description="Monte escalas automáticas para eventos e cultos com poucos cliques."
          />

          <CardInfo
            icon={Users2}
            title="Gerencie Bandas"
            description="Cadastre suas bandas e integrantes de forma prática e visual."
          />

          <CardInfo
            icon={Users2}
            title="Acompanhe tudo"
            description="Tenha uma visão geral das escalas e mantenha todos sincronizados."
          />
        </section>

        <section className="w-full rounded-lg bg-teal-700 py-16 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Comece agora e simplifique a organização dos seus Grupos!
          </h2>
          <p className="mb-8 text-white/90">
            Crie sua conta gratuita e comece a gerenciar suas escalas em poucos
            minutos.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-card font-semibold text-teal-700 transition hover:bg-gray-100"
            >
              Criar Conta Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>
    </HydrateClient>
  );
}
