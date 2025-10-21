import { CreateParticipantForm } from "./create-participant-form";
import { CreateScaleForm } from "./create-scale-form";
import { CreatedParticipant } from "./created-participant";
import { TabsContentCustom } from "./tab-content-custom";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Users } from "lucide-react";

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
            value="participants"
          >
            <Users />
            Integrantes
          </TabsTrigger>
        </TabsList>
        <TabsContentCustom title="Gerenciar Escalas" value="scales">
          <CreateScaleForm />
        </TabsContentCustom>

        <TabsContentCustom title="Gerenciar Participantes" value="participants">
          <CreateParticipantForm />
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">Todos os Participantes</h4>
            <CreatedParticipant
              id=""
              name="Renata Karolina"
              functions={["guitar", "vocal"]}
              whatsapp="67991687767"
            />
            <CreatedParticipant
              id=""
              name="Renata Karolina"
              functions={["guitar", "vocal"]}
              whatsapp="67991687767"
            />
            <CreatedParticipant
              id=""
              name="Renata Karolina"
              functions={["guitar", "vocal"]}
              whatsapp="67991687767"
            />
          </div>
        </TabsContentCustom>
      </Tabs>
    </div>
  );
}
