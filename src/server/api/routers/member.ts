import { getUserPermissions } from "@/lib/utils/getUserPermitions";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getMembership } from "@/server/utils/get-memberhip";
import { BandRole } from "@prisma/client";
import { z } from "zod";

export const memberRouter = createTRPCRouter({
  getUserMembership: protectedProcedure
    .input(
      z.object({
        nickname: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await getMembership(
        input.nickname,
        ctx.session.user.id,
        ctx.db,
      );

      if (!member) {
        return null;
      }

      const { band, ...membership } = member;

      return {
        membership,
        band,
      };
    }),

  getUserMembershipByUserId: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const member = await ctx.db.bandMember.findMany({
        where: { userId: input.userId },
      });

      const hasBand = await ctx.db.band.findFirst({
        where: { createdById: input.userId },
      });

      return {
        isMember: Boolean(member),
        hasBand: Boolean(hasBand),
      };
    }),

  getBandMembers: protectedProcedure
    .input(
      z.object({
        nickname: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const member = await getMembership(input.nickname, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { band, ...membership } = member;

      if (membership.role === "MEMBER") {
        return null;
      }

      return ctx.db.bandMember.findMany({
        where: { band: { id: band.id } },
        select: {
          id: true,
          role: true,
          instruments: true,
          band: {
            select: {
              createdById: true,
            },
          },
          isActive: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              whatsapp: true,
            },
          },
        },
      });
    }),

  updateMember: protectedProcedure
    .input(
      z.object({
        bandNickname: z.string(),
        memberId: z.string(),
        role: z.enum([BandRole.ADMIN, BandRole.MEMBER, BandRole.OWNER]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const membership = await getMembership(
        input.bandNickname,
        userId,
        ctx.db,
      );

      if (!membership) {
        throw new Error("Cannot find membership");
      }

      const { cannot } = getUserPermissions(membership.userId, membership.role);

      if (cannot("update", "User")) {
        throw new Error("Not authorized to update user");
      }

      if (input.role === "OWNER") {
        // find the current OWNER
        await ctx.db.$transaction(async (tx) => {
          const currentOwner = await tx.bandMember.findFirst({
            where: {
              bandId: membership.bandId,
              role: BandRole.OWNER,
            },
          });

          if (currentOwner) {
            await tx.bandMember.update({
              where: {
                bandId_userId: {
                  bandId: membership.bandId,
                  userId: currentOwner.userId,
                },
              },
              data: { role: BandRole.ADMIN },
            });
          }

          await tx.bandMember.update({
            where: {
              bandId_userId: {
                bandId: membership.bandId,
                userId: input.memberId,
              },
            },
            data: { role: BandRole.OWNER },
          });
        });
      } else {
        return ctx.db.bandMember.update({
          where: {
            bandId_userId: {
              bandId: membership.bandId,
              userId: input.memberId,
            },
          },
          data: { role: input.role },
        });
      }
    }),

  updateActiveStats: protectedProcedure
    .input(
      z.object({
        bandId: z.string(),
        memberId: z.string(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bandId, memberId, isActive } = input;
      const userId = ctx.session.user.id ?? "";

      const member = await ctx.db.bandMember.findFirst({
        where: {
          userId,
          bandId,
        },
      });

      if (!member) {
        return null;
      }

      if (member.role === "MEMBER") {
        throw new Error("Not authorized to remove member");
      }

      return ctx.db.bandMember.update({
        where: { bandId_userId: { bandId, userId: memberId } },
        data: { isActive },
      });
    }),
  updateInstruments: protectedProcedure
    .input(
      z.object({
        memberId: z.string(),
        bandId: z.string(),
        instruments: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { memberId, bandId, instruments } = input;
      const userId = ctx.session.user.id ?? "";

      const member = await ctx.db.bandMember.findFirst({
        where: {
          userId,
          bandId,
        },
      });

      if (!member) {
        return null;
      }

      if (member.role === "MEMBER") {
        throw new Error("Not authorized to update member");
      }

      const result = await ctx.db.bandMember.update({
        where: { bandId_userId: { bandId, userId: memberId } },
        data: { instruments },
      });

      return result;
    }),
  removeMember: protectedProcedure
    .input(
      z.object({
        bandId: z.string(),
        memberId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { bandId, memberId } = input;
      const userId = ctx.session.user.id ?? "";

      const member = await ctx.db.bandMember.findFirst({
        where: {
          userId,
          bandId,
        },
      });

      if (!member) {
        return null;
      }

      if (member.role === "MEMBER") {
        throw new Error("Not authorized to remove member");
      }

      const memberSchedules = await ctx.db.scheduleParticipant.findMany({
        where: { participantId: memberId },
      });

      // await ctx.db.$transaction(async (tx) => {
      //   await tx.scheduleParticipant.deleteMany({
      //     where: { participantId: memberId },
      //   });
      // });
      // return ctx.db.bandMember.delete({
      //   where: { bandId_userId: { bandId, userId: memberId } },
      // });
    }),
});
