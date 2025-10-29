"use client";

import { CreateParticipantForm } from "./create-participant-form";
import { TabsContentCustom } from "./tab-content-custom";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Users } from "lucide-react";
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
            value="invitations"
          >
            <Users />
            Participantes
          </TabsTrigger>
        </TabsList>
        <TabsContentCustom title="Gerenciar Escalas" value="scales">
          <ScheduleForm />

          <ListSchedule />
        </TabsContentCustom>

        <TabsContentCustom title="Gerenciar Integrantes" value="invitations">
          <CreateParticipantForm />
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">Todos os Participantes</h4>
            <ListParticipants />
          </div>
        </TabsContentCustom>
      </Tabs>
    </div>
  );
}
