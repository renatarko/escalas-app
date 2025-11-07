import { api } from "@/trpc/react";
import { getCurrentBandFromCookie } from "../utils/getCurrentBandFromCookie";
import type { BandRole } from "@prisma/client";
import { useSession } from "next-auth/react";

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

export const useCurrentMember = () => {
  const { data: bands } = api.band.getBands.useQuery();
  const { data: session } = useSession();

  if (!session?.user?.id) {
    console.log("❌ getCurrentMembership: No user session found");
    return null;
  }
  console.log(
    "👤 getCurrentMembership: User email from session:",
    session.user.email,
  );

  console.log(
    "🏢 getCurrentMembership: Found bands count:",
    bands?.length ?? 0,
  );

  if (!bands?.length) {
    console.log("❌ getCurrentMembership: User has no bands");
    return null;
  }

  const firstBand = bands[0];
  if (!firstBand || !firstBand.nickname) {
    console.log("❌ getCurrentMembership: First organization has no slug");
    return null;
  }
  console.log("🏢 getCurrentMembership: Selected organization:", {
    id: firstBand.id,
    slug: firstBand.nickname,
  });

  let userMember: { id: string; role: BandRole } | null = null;

  for (const item of bands) {
    const found = item.members.find((member) => {
      return member.userId === session.user.id;
    });
    if (found) {
      userMember = { id: found.userId, role: found.role };
      break;
    }
  }

  if (!userMember) {
    console.log(
      "❌ getCurrentMembership: User is not a member of the selected band",
    );
    return null;
  }

  console.log(
    "✅ getCurrentMembership: Found membership via fallback mechanism",
  );

  return {
    id: userMember.id,
    role: userMember.role,
    hasSomeBand: bands && bands.length > 0,
  };
};
