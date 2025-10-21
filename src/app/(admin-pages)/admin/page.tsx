import { Tab } from "@/app/_components/tab";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { Calendar } from "lucide-react";

export default async function Admin() {
  const session = await auth();
  console.log({ session });

  if (!session?.user.role || session.user.role !== "ADMIN") {
    return <div>nao tem session</div>;
  }

  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 py-12">
        <div className="flex flex-col gap-2 rounded-lg p-10 shadow-lg">
          <h1 className="font-extrabold tracking-tight sm:text-[5rem]">
            <Calendar className="mr-2 mb-2 inline-block h-6 w-6" />
            Escalas
          </h1>
          <h2>Gerencie ensaios e participantes de forma automática</h2>
        </div>

        <Tab />
      </main>
    </HydrateClient>
  );
}
