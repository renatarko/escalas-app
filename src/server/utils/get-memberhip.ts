import { type PrismaClient } from "@prisma/client";

export const getMembership = async (
  nickname: string,
  userId: string,
  db: PrismaClient,
) => {
  if (!nickname) {
    return null;
  }

  const member = await db.bandMember.findFirst({
    where: {
      userId,
      band: {
        nickname,
      },
    },
    include: {
      band: true,
    },
  });

  if (!member) {
    return null;
  }

  return member;
};
