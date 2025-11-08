"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, CalendarDays, CirclePlus, Users2 } from "lucide-react";
import { useTabsStore, type TabsStoreProps } from "@/stores/use-tabs-store";
import { CreateParticipantForm } from "@/app/_components/create-participant-form";
import { ListParticipants } from "@/app/_components/list-participants";
import { ListSchedule } from "@/app/_components/list-schedule";
import { TabsContentCustom } from "@/app/_components/tab-content-custom";
import React from "react";
import { CreateSchedule } from "./create-schedule";
import { ListInvite } from "./list-invite";
import { useCurrentMember } from "@/lib/hooks/members";
import { ListScheduleParticipant } from "./list-schedule-participant";

export function TabsContainer() {
  const member = useCurrentMember();
  const { tab, setTab } = useTabsStore();

  const handleTabChange = (value: string) => {
    setTab(value as TabsStoreProps);
  };

  const renderTabsContent = React.useMemo(() => {
    switch (tab) {
      case "my-scales":
        return (
          <TabsContentCustom title="Minhas Escalas">
            <ListScheduleParticipant />
          </TabsContentCustom>
        );
      case "scales":
        return (
          <TabsContentCustom title="Gerenciar Escalas">
            <ListSchedule />
          </TabsContentCustom>
        );
      case "create-scales":
        return (
          member &&
          member.role !== "MEMBER" && (
            <TabsContentCustom title="Criar Escala">
              <CreateSchedule />
            </TabsContentCustom>
          )
        );
      case "participants":
        return (
          member &&
          member.role !== "MEMBER" && (
            <TabsContentCustom title="Gerenciar Integrantes">
              <ListParticipants />
            </TabsContentCustom>
          )
        );
      case "invitations":
        return (
          member &&
          member.role !== "MEMBER" && (
            <TabsContentCustom title="Convidar Integrantes">
              <CreateParticipantForm />
              <ListInvite />
            </TabsContentCustom>
          )
        );
      default:
        return null;
    }
  }, [tab, member]);

  return (
    <Tabs
      value={tab}
      onValueChange={handleTabChange}
      className="space-y-4 sm:mt-0"
    >
      <TabsList className="bg-muted/60 border-border hidden h-20 w-full rounded-none border p-0 sm:flex">
        <TabsTrigger className="h-full w-full rounded-none" value="scales">
          <CalendarDays /> Escalas
        </TabsTrigger>

        <TabsTrigger className="h-full w-full rounded-none" value="my-scales">
          <Calendar /> Minhas Escalas
        </TabsTrigger>

        {member && member.role !== "MEMBER" && (
          <TabsTrigger
            className="h-full w-full rounded-none"
            value="create-scales"
          >
            <CirclePlus /> Criar Escala
          </TabsTrigger>
        )}

        {member && member.role !== "MEMBER" && (
          <TabsTrigger
            className="h-full w-full rounded-none"
            value="participants"
          >
            <Users2 />
            Integrantes
          </TabsTrigger>
        )}

        {member && member.role !== "MEMBER" && (
          <TabsTrigger
            className="h-full w-full rounded-none"
            value="invitations"
          >
            <Users2 />
            Convites
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent
        value={tab}
        className="min-h-20 w-full px-2 pt-0 pb-4 sm:px-4"
      >
        {renderTabsContent}
      </TabsContent>
    </Tabs>
  );
}
