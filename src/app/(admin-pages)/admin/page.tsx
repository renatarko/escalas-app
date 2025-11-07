import { auth } from "@/server/auth";
import { Unauthorized } from "@/app/_components/unauthorized";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { TabsContainer } from "@/app/_components/tabs-container";

const getCurrentBandFromCookieServer = async () => {
  const cookieStore = cookies();
  const nicknameCookie = (await cookieStore).get("nicknameBand");
  return nicknameCookie?.value ?? null;
};

export default async function Admin() {
  const session = await auth();
  const nickname = await getCurrentBandFromCookieServer();

  if (!session || !nickname) {
    return (
      <div className="mt-24 flex w-full items-center justify-center">
        <Unauthorized />
      </div>
    );
  }

  const userIsOwnerOrAdmin = await api.band.getByUserId({
    userId: session?.user.id,
    nickname,
  });

  if (!userIsOwnerOrAdmin) {
    return (
      <div className="mt-24 flex w-full items-center justify-center">
        <Unauthorized />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-lg shadow-lg">
      <TabsContainer />
    </div>
  );
}
