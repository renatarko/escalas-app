import { Send } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ParticipantCard } from "./participant-card";

type ScaleCardProps = {
  name: string;
  status: "waiting_confirmation" | "all_confirmed";
  participants: {
    // id: string;
    name: string;
    confirmed: boolean | null;
    instrument: string;
  }[];
};

export const ScaleCard = ({ name, status, participants }: ScaleCardProps) => {
  return (
    <div className="border-border mt-8 space-y-4 rounded-lg border p-3">
      <h5 className="text-lg font-bold">{name}</h5>
      <div className="flex justify-between">
        {status === "waiting_confirmation" && (
          <Badge variant="outline" className="bg-yellow-600/50 py-0 text-xs">
            Aguardando confirmações
          </Badge>
        )}
        {status === "all_confirmed" && (
          <Badge variant="outline" className="bg-green-600/50 py-0 text-xs">
            Todos confirmados
          </Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="bg-green-400/70 text-sm hover:bg-green-500/90"
        >
          <Send />
          Enviar notificação
        </Button>
      </div>
      <div className="space-y-2">
        {participants.length > 0 &&
          participants.map((participant) => (
            <ParticipantCard key={participant.name} {...participant} />
          ))}
      </div>
    </div>
  );
};
