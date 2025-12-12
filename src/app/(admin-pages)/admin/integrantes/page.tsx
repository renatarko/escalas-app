import { MembersList } from "@/app/_components/member/members-list";
import { HeaderPanel } from "@/app/_components/header-panel";
import { Unauthorized } from "@/app/_components/unauthorized";
import { getCurrentMembership, getCurrentOrg } from "@/lib/auth/ability";
import { isAdmin } from "@/lib/utils/role-checker";
import { auth } from "@/server/auth";

export default async function IntegrantesPage() {
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
    <>
      <HeaderPanel
        title="Integrantes"
        description="Gerencie os membros da banda"
      />
      <MembersList />
    </>
  );
}
