"use client";

import { useFindManyMembers } from "@/lib/hooks/members";
import { CreatedParticipant } from "./created-participant";

export const ListParticipants = () => {
  const { members, isLoading } = useFindManyMembers();

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="bg-muted h-20 w-full animate-pulse rounded-lg border p-8"></div>
      </div>
    );
  }

  if (!members) {
    return (
      <div className="flex w-full items-center justify-center">
        <p>Não encontramos nenhum participante</p>
      </div>
    );
  }

  return members.map((member) => (
    <CreatedParticipant key={member.id} {...member} />
  ));
};
