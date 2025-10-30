"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { Spinner } from "./ui/spinner";
import {
  instrumentOptions,
  instrumentsIcons,
  invitationStatusLabel,
  memberRoleLabel,
} from "@/lib/constants";
import type { InvitationStatus } from "@prisma/client";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import type { Instrument } from "@/lib/types";
import { Button } from "./ui/button";
import { EllipsisVertical } from "lucide-react";

export const ListInvite = () => {
  const { bandId, isLoading } = useFindCurrentBandId();
  const { data: invitations } = api.invitation.getPendingInvitations.useQuery(
    {
      bandId: bandId ?? "",
    },
    { enabled: !!bandId },
  );

  console.log(invitations);

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  const setBackgroundColorByStatus = (status: InvitationStatus) => {
    if (status === "CANCELLED") return "bg-destructive";
    if (status === "EXPIRED") return "bg-orange-600";
    if (status === "PENDING") return "bg-yellow-600";
  };

  return (
    <div className="w-full space-y-4 py-8">
      <h4 className="text-lg font-semibold">Convites Pendentes</h4>

      {invitations?.length === 0 && (
        <p className="text-muted-foreground text-center">
          Não há convites pendentes
        </p>
      )}

      {invitations &&
        invitations?.length > 0 &&
        invitations.map((invitation) => (
          <div
            key={invitation.email}
            className="bg-muted/50 flex items-center justify-between p-4"
          >
            <div className="space-y-1">
              <p className="text-sm">{invitation.email}</p>
              <p className="text-muted-foreground text-xs">
                {memberRoleLabel[invitation.role!]}
              </p>
            </div>

            {invitation.instruments.length > 0 && (
              <div className="text-center">
                <p className="text-muted-foreground text-xs font-medium">
                  Funções
                </p>
                <ul className="flex list-none items-center gap-2">
                  {invitation.instruments.map((func) => (
                    <li key={func}>
                      <Tooltip>
                        <TooltipTrigger className="bg-accent mr-2 inline-flex items-center justify-center rounded-md p-2 shadow-md">
                          {instrumentsIcons[func as Instrument]}
                        </TooltipTrigger>
                        <TooltipContent>
                          {
                            instrumentOptions.find(
                              (instrument) => instrument.value === func,
                            )?.label
                          }
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-x-1 text-center">
              <Badge className={setBackgroundColorByStatus(invitation.status)}>
                {invitationStatusLabel[invitation.status]}
              </Badge>

              <Button variant="ghost" size="icon-sm">
                <EllipsisVertical className="size-4" />
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
};
