import { ActionCard } from "@/app/_components/schedule/confirmation/action-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { api } from "@/trpc/server";
import { Ban } from "lucide-react";

type Params = {
  params: Promise<{ scheduleParticipantId: string }>;
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

    return (
      <ActionCard
        participantId={pending.participantId}
        pendingConfirmationId={pending.id}
        schedule={{
          id: pending.scheduleId,
          band: {
            name: pending.schedule.band.name,
          },
          name: pending.schedule.name,
        }}
      />
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
