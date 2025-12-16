import { api, HydrateClient } from "@/trpc/server";
import { ArrowRight, CalendarDays, Settings, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./_components/ui/button";
import { CardInfo } from "./_components/ui/card-info";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

async function getMemberData(userId?: string) {
  if (!userId) {
    return null;
  }

  const data = await api.bandMember.getUserMembershipByUserId({ userId });
  return data;
}

export default async function Home() {
  const session = await auth();

  const data = await getMemberData(session?.user.id);

  redirect("/landing-page");

  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 pt-28 pb-12">
        <section className="space-y-8 px-6 pb-10 text-center sm:pt-16">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-extrabold sm:text-5xl">
              Organize suas <span className="text-teal-700">escalas</span> com
              facilidade
            </h1>
            <p className="text-muted-foreground text-md sm:text-lg">
              Gerencie bandas, integrantes e escalas de forma automática e sem
              complicações.
            </p>
          </div>
          {!session?.user && (
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-teal-700 px-8 text-white hover:bg-teal-800"
                >
                  Criar Conta
                </Button>
              </Link>
              <Link href="/auth/sign-in">
                <Button size="lg" variant="outline" className="px-10">
                  Entrar
                </Button>
              </Link>
            </div>
          )}

          {data?.isMember && !data?.hasBand && (
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
                <Settings className="size-4" />
                Começar a Gerenciar
              </Button>
            </Link>
          )}

          {data?.hasBand && (
            <Link href="/admin/manager">
              <Button
                size="lg"
                className="bg-teal-700 text-white hover:bg-teal-800"
              >
                <Settings className="size-4" />
                Gerenciar Escalas
              </Button>
            </Link>
          )}
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
