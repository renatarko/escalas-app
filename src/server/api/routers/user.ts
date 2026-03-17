import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { hash } from "bcrypt";
import { randomUUID } from "node:crypto";
import { ResetPasswordEmailTemplate } from "@/app/_components/emails/reset-password";
import { getData, sendEmail } from "@/lib/mailer";
import { env } from "@/env";

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
        password: z.string().min(6),
        role: z.enum(["ADMIN", "USER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data: {
        name: string;
        email: string;
        whatsapp: string;
        role: "ADMIN" | "USER";
        password: string;
      } = {
        name: input.name,
        email: input.email,
        whatsapp: input.whatsapp,
        role: input.role,
        password: input.password,
      };

      const alreadyUserEmail = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (alreadyUserEmail) {
        throw new Error("E-mail já está cadastrado.");
      }

      const password = await hash(input.password, 10);
      const newUser = await ctx.db.user.create({
        data: {
          ...data,
          password,
        },
        select: {
          id: true,
          name: true,
          email: true,
          whatsapp: true,
          role: true,
        },
      });
      return newUser;
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

      const updateData: {
        name?: string;
        email?: string;
        whatsapp?: string;
        role?: "ADMIN" | "USER";
        password?: string;
      } = data;

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

  // Solicitar redefinição de senha
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { id: true, email: true, password: true },
      });

      // Retorna sucesso mesmo se email não existe (evita enumeração)
      if (!user?.password) return { success: true };

      const token = randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      const identifier = `password-reset:${input.email}`;

      // Remove token anterior se existir
      await ctx.db.verificationToken.deleteMany({
        where: { identifier },
      });

      await ctx.db.verificationToken.create({
        data: { identifier, token, expires },
      });

      const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

      const emailHtml = await getData(
        ResetPasswordEmailTemplate({ email: input.email, resetUrl }),
      );

      await sendEmail(
        input.email,
        "Escalas App - Redefinição de senha",
        emailHtml,
      );

      return { success: true };
    }),

  // Redefinir senha com token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const record = await ctx.db.verificationToken.findUnique({
        where: { token: input.token },
      });

      if (!record) {
        throw new Error("Token inválido ou expirado.");
      }

      if (record.expires < new Date()) {
        await ctx.db.verificationToken.delete({ where: { token: input.token } });
        throw new Error("Token expirado. Solicite uma nova redefinição.");
      }

      if (!record.identifier.startsWith("password-reset:")) {
        throw new Error("Token inválido.");
      }

      const email = record.identifier.replace("password-reset:", "");

      const hashedPassword = await hash(input.password, 10);

      await ctx.db.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      await ctx.db.verificationToken.delete({ where: { token: input.token } });

      return { success: true };
    }),
});
