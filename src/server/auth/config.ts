import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  CredentialsSignin,
  type DefaultSession,
  type NextAuthConfig,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { type Adapter } from "next-auth/adapters";
import { db } from "@/server/db";
import { cookies } from "next/headers";
import { env } from "@/env";
import { InviteEmailTemplate } from "@/app/_components/emails/invite";
import { getData, sendEmail } from "@/lib/mailer";
import type { BandRole } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    // ...other properties
    role: "USER" | "ADMIN";
  }
}

export const sendVerificationRequest = async ({
  identifier: email,
  url,
  provider,
}: any): Promise<void> => {
  const emailHtml = await getData(
    InviteEmailTemplate({ email, bandName: "", inviteId: "" }),
  );
  console.log({ url, email });
  try {
    await sendEmail(email, "Testando o Invite por email", emailHtml, provider);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Email e Senha",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("nao encontrou user no banco?", user);

        // Se usuário não existe ou não tem senha, rejeita
        if (!user) {
          console.log("User not found");
          return null;
        }

        // Verifica senha
        if (!user.password) {
          console.log("User has no password set");
          // usuário existe mas não tem senha (ex.: criado via OAuth) — rejeita login por credenciais
          throw new Error(
            "Usuário registrado via outro provedor. Use o login correspondente.",
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          console.log("Invalid password");
          throw new Error("Senha inválida");
        }

        console.log("User authenticated:", user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image ?? null,
        };
      },
    }),
    EmailProvider({
      id: "email",
      server: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      },
      from: env.SMTP_FROM,
      sendVerificationRequest,
    }),
  ],
  /**
   * ...add more providers here.
   *
   * Most other providers require a bit more work than the Discord provider. For example, the
   * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
   * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
   *
   * @see https://next-auth.js.org/providers/github
   */
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 days
  },
  adapter: PrismaAdapter(db) as Adapter,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token }) {
      // if (user) {
      //   token = {
      //     ...token,
      //     id: user.id,
      //     name: user.name,
      //     email: user.email,
      //     image: user.image,
      //     role: user.role,
      //   };
      //   return token;
      // }

      console.log("token", token);
      const dbUser = await db.user.findUnique({
        where: { email: token.email ?? "" },
        include: {
          bandMemberships: {
            select: {
              band: {
                select: { nickname: true },
              },
            },
          },
        },
      });

      const cookieStore = cookies();
      const inviteToken = (await cookieStore).get("invite-token")?.value;
      console.log({ inviteToken, dbUser });

      if (inviteToken && dbUser) {
        try {
          const invite = await db.bandInvitation.findUnique({
            where: { token: inviteToken },
          });

          if (invite && invite.email === dbUser.email) {
            await db.$transaction([
              db.bandMember.create({
                data: {
                  userId: dbUser.id,
                  bandId: invite.bandId,
                  joinedAt: new Date(),
                  role: "MEMBER",
                },
              }),
              db.bandInvitation.update({
                where: { token: inviteToken },
                data: { status: "ACCEPTED" },
              }),
            ]);

            const band = await db.band.findUnique({
              where: { id: invite.bandId },
              select: { nickname: true },
            });

            if (band?.nickname) {
              (await cookieStore).set("bandNickname", band.nickname);
            }
          }

          // (await cookieStore).delete("invite-token");
          console.log("Agora seria deletar o cookie invite-token");
        } catch (error) {
          console.error("JWT Callback - Failed to process invite:", error);
        }
      }

      if (dbUser) {
        token = {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
          role: dbUser.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string, // Adiciona o id do token
          role: token.role as "USER" | "ADMIN", // Adiciona o role do token
        },
      };
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/sign-up",
  },
};
