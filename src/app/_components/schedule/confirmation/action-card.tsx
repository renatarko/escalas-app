"use client";

import { Calendar, Music } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";
import { SuccessCard } from "./success-card";
import { Spinner } from "../../ui/spinner";

type ActionCardProps = {
  participantId: string;
  pendingConfirmationId: string;
  schedule: {
    id: string;
    name: string | null;
    band: {
      name: string | null;
    } | null;
  };
};

export const ActionCard = ({
  schedule,
  participantId,
  pendingConfirmationId,
}: ActionCardProps) => {
  const [actionDone, setActionDone] = useState<"do" | "done">("do");
  const [confirmed, setConfirmed] = useState(false);

  const utils = api.useUtils();

  const updateConfirmation = api.scheduleParticipant.updateById.useMutation({
    async onSuccess() {
      await utils.pendingConfirmation.getById.invalidate();
    },
  });

  const updateScheduleParticipant = async (confirmed: boolean) => {
    const result = await updateConfirmation.mutateAsync({
      participantId,
      scheduleId: schedule.id,
      pendingConfirmationId,
      confirmed,
    });

    if (result.success) {
      setActionDone("done");
      setConfirmed(confirmed);
    }
  };

  if (actionDone === "done") {
    return <SuccessCard schedule={schedule} confirmed={confirmed} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            Confirmar presença na escala!
          </CardTitle>
          <CardDescription>
            <div className="rounded-lg bg-gray-50 p-4 text-left">
              <p className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <strong>Escala:</strong> {schedule.name}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Music className="h-4 w-4" />
                <strong>Banda:</strong> {schedule?.band?.name}
              </p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg text-gray-700 sm:text-start">
            Confirma sua participação?
          </p>
        </CardContent>
        <CardFooter className="w-full gap-2">
          <Button
            className="flex-1"
            variant="outline"
            disabled={updateConfirmation.isPending}
            onClick={() => updateScheduleParticipant(false)}
          >
            {updateConfirmation.isPending && <Spinner />}
            Não
          </Button>
          <Button
            className="flex-1"
            disabled={updateConfirmation.isPending}
            onClick={() => updateScheduleParticipant(true)}
          >
            {updateConfirmation.isPending && <Spinner />}
            Sim
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
