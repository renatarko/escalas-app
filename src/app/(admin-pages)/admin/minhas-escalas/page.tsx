import { ListScheduleParticipant } from "@/app/_components/list-schedule-participant";
import { HeaderPanel } from "@/app/_components/header-panel";
import { Unauthorized } from "@/app/_components/unauthorized";
import { getCurrentMembership, getCurrentOrg } from "@/lib/auth/ability";
import { auth } from "@/server/auth";

export default async function MinhasEscalasPage() {
  const session = await auth();
  const membership = await getCurrentMembership();
  const nickname = await getCurrentOrg();

  if (!session || !nickname || !membership) {
    return (
      <div className="mt-10 flex w-full justify-center">
        <Unauthorized />
      </div>
    );
  }

  return (
    <>
      <HeaderPanel title="Minhas Escalas" />
      <ListScheduleParticipant />
    </>
  );
}
