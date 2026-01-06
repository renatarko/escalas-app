import { Calendar, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

export const SuccessCard = ({
  schedule,
  confirmed,
}: {
  schedule: { name: string | null; band: { name: string | null } | null };
  confirmed: boolean;
}) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Ação Registrada com Sucesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {confirmed ? (
            <p className="text-lg text-gray-700">
              Obrigado por confirmar sua presença na escala!
            </p>
          ) : (
            <p className="text-lg text-gray-700">
              Obrigado por registrar a sua ausência!
            </p>
          )}

          <div className="rounded-lg bg-gray-50 p-4 text-left">
            <p className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <strong>Escala:</strong> {schedule.name}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <strong>Banda:</strong> {schedule.band?.name}
            </p>
          </div>

          {confirmed && (
            <p className="pt-4 text-sm text-gray-500">Te esperamos lá</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
