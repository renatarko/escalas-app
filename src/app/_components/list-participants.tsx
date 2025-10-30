"use client";

import { useFindManyMembers } from "@/lib/hooks/members";
import { CreatedParticipant } from "./created-participant";
import { Spinner } from "./ui/spinner";

export const ListParticipants = () => {
  const { members, isLoading } = useFindManyMembers();

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center">
        <Spinner className="size-10" />
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
