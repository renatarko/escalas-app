import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { api } from "@/trpc/server";
import { Ban, Calendar, CheckCircle2, Users } from "lucide-react";

type Params = {
  params: Promise<{ scheduleParticipantId: string }>;
};

type GetScheduleParticipantById = {
  participantId: string;
  scheduleId: string;
  pendingConfirmationId: string;
};
const updateScheduleParticipant = async ({
  participantId,
  scheduleId,
  pendingConfirmationId,
}: GetScheduleParticipantById) => {
  const result = await api.scheduleParticipant.updateById({
    participantId,
    scheduleId,
    pendingConfirmationId,
  });

  return result.success;
};

const getPendingConfirmation = async ({ id }: { id: string }) => {
  const data = await api.pendingConfirmation.getById({ id });
  return data;
};

export default async function ConfirmationPage({ params }: Params) {
  const { scheduleParticipantId } = await params;

  const pendingConfirmation = await getPendingConfirmation({
    id: scheduleParticipantId,
  });

  if (!scheduleParticipantId) {
    return <ErrorState />;
  }

  if (!pendingConfirmation) {
    return <ErrorState />;
  }

  try {
    const pending = await api.pendingConfirmation.getById({
      id: scheduleParticipantId,
    });

    if (!pending) {
      return <p>Não encontrado</p>;
    }

    if (pending.status === "completed") {
      return <AlreadyResponded confirmed={true} schedule={pending.schedule} />;
    }

    await updateScheduleParticipant({
      participantId: pendingConfirmation?.participantId,
      scheduleId: pendingConfirmation?.scheduleId,
      pendingConfirmationId: pendingConfirmation.id,
    });

    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Presença Confirmada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg text-gray-700">
              Obrigado por confirmar sua presença na escala!
            </p>

            <div className="rounded-lg bg-gray-50 p-4 text-left">
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <strong>Escala:</strong> {pending.schedule.name}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <strong>Banda:</strong> {pending.schedule.band.name}
              </p>
            </div>

            <p className="pt-4 text-sm text-gray-500">Te esperamos lá</p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.log(error);
    return <ErrorState />;
  }
}

function AlreadyResponded({
  confirmed,
  schedule,
}: {
  confirmed: boolean;
  schedule: { name: string | null };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {confirmed ? "Você já confirmou!" : "Você já respondeu essa escala"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          <p>Escala: {schedule.name}</p>
          <p className="mt-2">Obrigado pela resposta!</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({
  description = "O link pode estar expirado ou inválido. Tente novamente ou entre em contato com o administrador da escala.",
}: {
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50 p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Ban className="size-6" />
            Ops! Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-6">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
