import { auth } from "@/server/auth";
import { CreateParticipantForm } from "@/app/_components/create-participant-form";
import { ListParticipants } from "@/app/_components/list-participants";
import { ListSchedule } from "@/app/_components/list-schedule";
import ScheduleForm from "@/app/_components/schedule-form";
import { TabsContentCustom } from "@/app/_components/tab-content-custom";
import { Tabs, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { CirclePlus, Users2, Calendar } from "lucide-react";
import { Unauthorized } from "@/app/_components/unauthorized";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { ListInvite } from "@/app/_components/list-invite";
import { ScrollArea, ScrollBar } from "@/app/_components/ui/scroll-area";

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
      <Tabs defaultValue="scales" className="w-full gap-6">
        <ScrollArea className="w-full overflow-x-auto whitespace-nowrap md:overflow-x-visible">
          <TabsList className="bg-muted/60 border-border h-20 w-full rounded-none border p-0">
            <TabsTrigger className="h-full w-full rounded-none" value="scales">
              <Calendar /> Escalas
            </TabsTrigger>
            <TabsTrigger
              className="h-full w-full rounded-none"
              value="create-scale"
            >
              <CirclePlus /> Criar Escala
            </TabsTrigger>
            <TabsTrigger
              className="h-full w-full rounded-none"
              value="participants"
            >
              <Users2 />
              Participantes
            </TabsTrigger>
            <TabsTrigger
              className="h-full w-full rounded-none"
              value="invitations"
            >
              <Users2 />
              Convites
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <TabsContentCustom title="Criar Escala" value="create-scale">
          <ScheduleForm />
        </TabsContentCustom>

        <TabsContentCustom title="Gerenciar Escalas" value="scales">
          <ListSchedule />
        </TabsContentCustom>

        <TabsContentCustom title="Gerenciar Integrantes" value="participants">
          <ListParticipants />
        </TabsContentCustom>

        <TabsContentCustom title="Convidar Integrantes" value="invitations">
          <CreateParticipantForm />
          <ListInvite />
        </TabsContentCustom>
      </Tabs>
    </div>
  );
}
