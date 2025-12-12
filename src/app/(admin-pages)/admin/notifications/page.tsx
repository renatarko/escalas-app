import { HeaderPanel } from "@/app/_components/header-panel";
import { Unauthorized } from "@/app/_components/unauthorized";
import { getCurrentMembership, getCurrentOrg } from "@/lib/auth/ability";
import { isAdmin } from "@/lib/utils/role-checker";
import { auth } from "@/server/auth";
import { NotificationLogs } from "@/app/_components/notification-logs";

export default async function NotificationsPage() {
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
        title="Notificações"
        description="Acompanhe as respostas dos integrantes"
      />
      <NotificationLogs />
    </>
  );
}
