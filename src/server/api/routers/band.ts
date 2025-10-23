import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { slugify } from "@/lib/utils";
import { TRPCError } from "@trpc/server";

export const bandRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const nickname = slugify(input.name);

      console.log({ nickname });

      const hasBandWithNickname = await ctx.db.band.findFirst({
        where: { nickname },
      });

      console.log({ hasBandWithNickname });

      if (hasBandWithNickname) {
        throw new Error(`Já existe uma banda com o nome ${input.name}`);
      }

      return ctx.db.band.create({
        data: {
          name: input.name,
          nickname,
          isActive: true,
          createdBy: {
            connect: {
              id: ctx.session?.user.id,
            },
          },
          members: {
            create: {
              user: {
                connect: {
                  id: ctx.session?.user.id,
                },
              },
              role: "OWNER",
            },
          },
        },
      });
    }),

  getBands: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User must be logged in",
      });
    }

    try {
      return await ctx.db.band.findMany({
        where: {
          OR: [
            { createdById: ctx.session.user.id },
            {
              members: {
                some: {
                  id: ctx.session.user.id,
                },
              },
            },
          ],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
        cause: error,
      });
    }
  }),
});
