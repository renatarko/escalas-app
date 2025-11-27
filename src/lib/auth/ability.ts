"use server";

import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { cookies } from "next/headers";
import { defineAbilityFor } from ".";

export async function getCurrentOrg() {
  const cookie = (await cookies()).get("nicknameBand")?.value;
  return cookie ?? null;
}

export async function getCurrentMembership() {
  console.log("🔍 getCurrentMembership: Starting function execution");

  const nickname = await getCurrentOrg();
  console.log("🍪 getCurrentMembership: Cookie nicknameBand value:", nickname);

  if (nickname) {
    console.log(
      "✅ getCurrentMembership: Found nicknameBand in cookies, fetching membership",
    );
    const result = await api.bandMember.getUserMembership({ nickname });
    if (result?.membership) {
      console.log(
        "✅ getCurrentMembership: Successfully found membership using cookie nicknameBand",
      );
      return result.membership;
    } else {
      console.log(
        "❌ getCurrentMembership: No membership found for nicknameBand in cookie",
      );
    }
  }

  try {
    console.log(
      "🔄 getCurrentMembership: Trying fallback - looking for any user organization",
    );
    const session = await auth();
    if (!session?.user?.id) {
      console.log("❌ getCurrentMembership: No user session found");
      return null;
    }
    console.log(
      "👤 getCurrentMembership: User email from session:",
      session.user.email,
    );

    const bands = await api.band.getBands();
    console.log(
      "🏢 getCurrentMembership: Found organizations count:",
      bands?.length || 0,
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
      nickname: firstBand.nickname,
    });

    // Nota: Não podemos definir cookies aqui durante renderização de Server Components
    // O cookie será definido no callback signIn do NextAuth ou via Server Action

    const userMember = firstBand.members.find(
      (member) => member.user.id === session.user.id,
    );

    if (!userMember) {
      console.log(
        "❌ getCurrentMembership: User is not a member of the selected organization",
      );
      return null;
    }

    console.log(
      "✅ getCurrentMembership: Found membership via fallback mechanism",
    );
    return {
      id: userMember.id,
      role: userMember.role,
      bandId: firstBand.id,
      userId: userMember.user.id,
    };
  } catch (error) {
    console.error(
      "❌ getCurrentMembership: Error in fallback mechanism:",
      error,
    );
    return null;
  }
}

export async function ability() {
  const membership = await getCurrentMembership();
  if (!membership) return null;

  const ability = defineAbilityFor({
    id: membership.userId,
    role: membership.role,
    __typename: "User",
  });

  return ability;
}
