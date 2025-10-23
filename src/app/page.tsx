import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { CreateBandDialog } from "./_components/create-band-dialog";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  // const bands = await api.band.getBands();
  // console.log({ bands });

  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 pt-28 pb-12">
        <div className="flex flex-col gap-2 rounded-lg p-10 shadow-lg">
          <h1 className="font-extrabold tracking-tight sm:text-[5rem]">
            <Calendar className="mr-2 mb-2 inline-block h-6 w-6" />
            Escalas
          </h1>
          <h2>Gerencie ensaios e participantes de forma automática</h2>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="text-lg font-semibold">Bem vindo(a) {user?.name}!</h3>
          {!!user && user.role === "ADMIN" ? (
            <div className="flex items-center">
              <p>Você não possui nenhuma escala,</p>
              <Link className="ml-2 underline" href="/admin">
                crie agora!
              </Link>
            </div>
          ) : (
            <p>Você ainda não possui uma banda.</p>
          )}
        </div>

        <CreateBandDialog />

        <p>Suas Bandas</p>
        {/* {bands.map((band) => (
          <div key={band.id}>
            <p>{band.name}</p>
            <p>Membros: {band.members.length}</p>
          </div>
        ))} */}
      </main>
    </HydrateClient>
  );
}
