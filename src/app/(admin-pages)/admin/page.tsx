import { InviteBandMemberDialog } from "@/app/_components/create-invitation";
import { Tab } from "@/app/_components/tab";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Admin() {
  const session = await auth();
  console.log({ session });

  if (!session?.user.role) {
    return <div>nao tem session</div>;
  }

  return (
    <HydrateClient>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center space-y-8 pt-28 pb-12">
        <Tab />
      </main>
    </HydrateClient>
  );
}
