import { CreateSchedule } from "@/app/_components/create-schedule";
import { EditUser } from "@/app/_components/edit-user";
import { HeaderPanel } from "@/app/_components/header-panel";
import { Unauthorized } from "@/app/_components/unauthorized";
import { getCurrentMembership, getCurrentOrg } from "@/lib/auth/ability";
import { isAdmin } from "@/lib/utils/role-checker";
import { auth } from "@/server/auth";

export default async function UserPage() {
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

  const { user } = membership;

  return (
    <>
      <HeaderPanel title="Minha Conta" />
      <EditUser user={user} />
    </>
  );
}
