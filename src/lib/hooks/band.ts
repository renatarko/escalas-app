import { api } from "@/trpc/react";
import { getCurrentBandFromCookie } from "../utils/getCurrentBandFromCookie";

export const useFindCurrentBandId = () => {
  const nickname = getCurrentBandFromCookie();
  const { data, isLoading, refetch } = api.band.getByNickname.useQuery({
    nickname: nickname ?? "",
  });

  const participants = data?.members.map((member) => ({
    name: member.user?.name,
    id: member.user?.id,
    instruments: member.instruments,
  }));

  return { bandId: data?.id, participants, isLoading, refetch };
};
