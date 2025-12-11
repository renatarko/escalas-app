import { CreateSchedule } from "@/app/_components/create-schedule";
import { TabsContentCustom } from "@/app/_components/tab-content-custom";
import { Unauthorized } from "@/app/_components/unauthorized";
import { getCurrentMembership, getCurrentOrg } from "@/lib/auth/ability";
import { isAdmin } from "@/lib/utils/role-checker";
import { auth } from "@/server/auth";

export default async function CriarEscalaPage() {
  const session = await auth();
  const membership = await getCurrentMembership();
  const nickname = await getCurrentOrg();

  const isUserAdmin = isAdmin(membership);

  if (!session || !nickname || !membership || !isUserAdmin) {
    return (
      <div className="mt-10 flex w-full justify-center">
        <Unauthorized />
      </div>
    );
  }

  return (
    <TabsContentCustom title="Criar Escala">
      <CreateSchedule />
    </TabsContentCustom>
  );
}
