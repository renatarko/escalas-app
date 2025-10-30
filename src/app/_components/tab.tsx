"use client";

import { CreateParticipantForm } from "./create-participant-form";
import { TabsContentCustom } from "./tab-content-custom";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, CirclePlus, Users2 } from "lucide-react";
import { ListParticipants } from "./list-participants";
import { ListSchedule } from "./list-schedule";
import ScheduleForm from "./schedule-form";

export function Tab() {
  return (
    <div className="flex w-full flex-col gap-6 rounded-lg shadow-lg">
      <Tabs defaultValue="scales" className="w-full gap-6">
        <TabsList className="bg-muted/60 border-border h-20 w-full rounded-none border-b p-0">
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
        </TabsContentCustom>
      </Tabs>
    </div>
  );
}
