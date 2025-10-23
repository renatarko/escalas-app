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
          band: {
            select: {
              createdById: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  updateMember: protectedProcedure
    .input(
      z.object({
        nickname: z.string(),
        memberId: z.string(),
        role: z.enum([BandRole.ADMIN, BandRole.MEMBER, BandRole.OWNER]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id ?? "";

      const member = await getMembership(input.nickname, userId, ctx.db);

      if (!member) {
        return null;
      }

      const { band, ...membership } = member;

      if (membership.role === "MEMBER") {
        throw new Error("Not authorized to update member");
      }

      return ctx.db.bandMember.update({
        where: { id: input.memberId, bandId: band.id },
        data: { role: input.role },
      });
    }),

  //   removeMember: protectedProcedure
  //     .input(
  //       z.object({
  //         slug: z.string(),
  //         memberId: z.string(),
  //       }),
  //     )
  //     .mutation(async ({ ctx, input }) => {
  //       const userId = ctx.session.user.id ?? "";

  //       const member = await getMembership(input.slug, userId, ctx.db);

  //       if (!member) {
  //         return null;
  //       }

  //       const { organization, ...membership } = member;

  //       const { cannot } = getUserPermissions(userId, membership.role);

  //       if (cannot("delete", "User")) {
  //         throw new Error("Not authorized to remove member");
  //       }

  //       return ctx.db.member.delete({
  //         where: { id: input.memberId, organizationId: organization.id },
  //       });
  //     }),
});
