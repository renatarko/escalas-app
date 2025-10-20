import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { hash } from "bcrypt";

export const userRouter = createTRPCRouter({
  // Listar todos os usuários
  getAll: publicProcedure
    .input(
      z
        .object({
          role: z.enum(["ADMIN", "USER"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findMany({
        where: input?.role ? { role: input.role } : undefined,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          role: true,
          createdAt: true,
        },
      });
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: { email: input.email },
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          password: true,
          role: true,
          createdAt: true,
          scheduleParticipants: {
            include: {
              schedule: true,
            },
          },
        },
      });
    }),

  // Buscar usuário por ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          role: true,
          createdAt: true,
          scheduleParticipants: {
            include: {
              schedule: true,
            },
          },
        },
      });
    }),

  // Criar usuário
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        whatsapp: z.string().min(10),
        password: z.string().min(6).optional(),
        role: z.enum(["ADMIN", "USER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data: any = {
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        role: input.role,
      };

      // Se tiver senha, faz o hash
      if (input.password) {
        data.password = await hash(input.password, 10);
      }

      return await ctx.db.user.create({
        data,
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          role: true,
        },
      });
    }),

  // Atualizar usuário
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3).optional(),
        email: z.string().email().optional(),
        whatsapp: z.string().min(10).optional(),
        role: z.enum(["ADMIN", "USER"]).optional(),
        password: z.string().min(6).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...data } = input;

      const updateData: any = data;

      // Se tiver nova senha, faz o hash
      if (password) {
        updateData.password = await hash(password, 10);
      }

      return await ctx.db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          role: true,
        },
      });
    }),

  // Deletar usuário
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.delete({
        where: { id: input.id },
      });
    }),

  // Listar apenas admins
  getAdmins: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }),

  // Listar apenas usuários comuns
  getUsers: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
      },
    });
  }),
});
