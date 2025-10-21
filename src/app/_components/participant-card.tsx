import { Badge } from "./ui/badge";

type ParticipantCard = {
  name: string;
  confirmed: boolean | null;
  instrument: string;
};

export const ParticipantCard = ({
  name,
  confirmed,
  instrument,
}: ParticipantCard) => {
  return (
    <div className="space-y-2">
      <div className="bg-muted flex items-center justify-between rounded p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full font-bold text-white">
            {name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-sm text-gray-600">{instrument}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmed === true && (
            <Badge className="bg-green-600">Confirmado</Badge>
          )}
          {confirmed === false && (
            <Badge variant="destructive">Rejeitado</Badge>
          )}
          {confirmed === null && (
            <Badge className="bg-orange-600">Pendente</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
