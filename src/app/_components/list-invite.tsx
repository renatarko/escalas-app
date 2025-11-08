"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { api } from "@/trpc/react";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { InviteCard } from "./invite-card";
import { Separator } from "./ui/separator";

export const ListInvite = () => {
  const { bandId, isLoading } = useFindCurrentBandId();
  const { data: allInvitations } = api.invitation.getInvitations.useQuery(
    {
      bandId: bandId ?? "",
    },
    { enabled: !!bandId },
  );

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 py-8">
      <h4 className="text-lg font-semibold">Todos Convites</h4>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger
            className="data-[state=active]:rounded-md"
            value="pending"
          >
            Pendentes
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:rounded-md"
            value="declined"
          >
            Negados
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:rounded-md"
            value="accepted"
          >
            Aceitos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          {allInvitations?.pending.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">
              Não há convites pendentes, expirados ou excluídos
            </p>
          )}
          {allInvitations?.pending.map((invitation, i) => (
            <>
              <InviteCard key={invitation.id} invitation={invitation} />
              {i < allInvitations.pending.length - 1 && <Separator />}
            </>
          ))}
        </TabsContent>

        <TabsContent value="declined">
          {allInvitations?.declined.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Não há convites negados
            </p>
          )}

          {allInvitations?.declined.map((invitation, i) => (
            <>
              <InviteCard key={invitation.id} invitation={invitation} />
              {i < allInvitations.declined.length - 1 && <Separator />}
            </>
          ))}
        </TabsContent>

        <TabsContent value="accepted">
          {allInvitations?.accepted.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Não há convites aceitos
            </p>
          )}

          {allInvitations?.accepted.map((invitation, i) => (
            <>
              <InviteCard key={invitation.id} invitation={invitation} />
              {i < allInvitations.accepted.length - 1 && <Separator />}
            </>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
