import { api } from "@/trpc/react";
import { getCurrentBandFromCookie } from "../utils/getCurrentBandFromCookie";

export const useFindManyMembers = () => {
  const nickname = getCurrentBandFromCookie();
  const { data, isLoading, refetch } = api.bandMember.getBandMembers.useQuery({
    nickname: nickname ?? "",
  });

  const members = data?.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    whatsapp: member.user.whatsapp,
    role: member.role,
    instruments: member.instruments,
    isActive: member.isActive,
  }));

  return { members, isLoading, refetch };
};
