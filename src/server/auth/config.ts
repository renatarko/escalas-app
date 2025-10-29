import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  CredentialsSignin,
  type DefaultSession,
  type NextAuthConfig,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider, { type EmailConfig } from "next-auth/providers/email";
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
      name?: string | null;
      email: string;
      emailVerified: boolean;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   id?: string
  //   role: "USER" | "ADMIN";
  //     name?: string | null
  //      email?: string | null
  //       emailVerified: boolean
  // }
}

export const sendVerificationRequest = async ({
  identifier: email,
  url,
  token,
  provider,
}: {
  identifier: string;
  url: string;
  token: string;
  provider?: EmailConfig;
}): Promise<void> => {
  try {
    const emailHtml = await getData(
      InviteEmailTemplate({ email, bandName: "", token }),
    );
    console.log({ url, email });
    await sendEmail(
      email,
      "Escalas App - Clique no link para verificar seu email",
      emailHtml,
      provider,
    );

    // const cookieStore = cookies();
    // (await cookieStore).set("invite-token", email);
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
      const nicknameBand = (await cookieStore).get("nicknameBand")?.value;

      if (!nicknameBand && dbUser && dbUser.bandMemberships.length > 0) {
        const firstNicknameBand = dbUser.bandMemberships[0]?.band.nickname;
        if (firstNicknameBand) {
          (await cookieStore).set("nicknameBand", firstNicknameBand, {
            maxAge: 60 * 24 * 60 * 60, // 60 days
          });
        }
      }

      console.log({ inviteToken, dbUser });

      if (inviteToken && dbUser) {
        try {
          const invite = await db.bandInvitation.findUnique({
            where: { token: inviteToken },
          });

          console.log({ invite });

          if (
            invite &&
            invite.email === dbUser.email &&
            invite.expiresAt > new Date()
          ) {
            // Verificar se já é membro
            const existingMember = await db.bandMember.findUnique({
              where: {
                bandId_userId: {
                  userId: dbUser.id,
                  bandId: invite.bandId,
                },
              },
            });

            if (!existingMember) {
              // Criar membro e deletar convite
              await db.$transaction([
                db.bandMember.create({
                  data: {
                    userId: dbUser.id,
                    bandId: invite.bandId,
                    role: invite.role ?? undefined,
                    instruments: invite.instruments,
                  },
                }),
                db.bandInvitation.update({
                  where: { id: invite.id },
                  data: { status: "ACCEPTED" },
                }),
              ]);

              // Atualizar nome do usuário se veio do convite e usuário não tem nome
              if (invite.name && !dbUser.name) {
                await db.user.update({
                  where: { id: dbUser.id },
                  data: { name: invite.name },
                });
              }

              // Definir a organização do convite como atual
              const band = await db.band.findUnique({
                where: { id: invite.bandId },
                select: { nickname: true },
              });

              if (band?.nickname) {
                (await cookieStore).set("nicknameBand", band.nickname, {
                  maxAge: 60 * 24 * 60 * 60,
                });
              }
            }
          }

          // Sempre limpar o cookie de convite após processar
          // await db.$transaction([
          //   db.bandMember.create({
          //     data: {
          //       userId: dbUser.id,
          //       bandId: invite.bandId,
          //       joinedAt: new Date(),
          //       role: invite.role ?? undefined,
          //     },
          //   }),
          //   db.bandInvitation.update({
          //     where: { token: inviteToken },
          //     data: { status: "ACCEPTED" },
          //   }),
          //   db.user.update({
          //     where: { email: invite.email },
          //     data: { name: "aqui seria o nome dado" },
          //   }),
          // ]);

          (await cookieStore).delete("invite-token");
          (await cookieStore).delete("invite-email");
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
      const modifiedSession = { ...session };
      if (token) {
        if (!modifiedSession.user) {
          // create a properly typed user object using values from the token (or sensible defaults)
          modifiedSession.user = {
            id: token.id as string,
            name: token.name as string | null,
            email: token.email!,
            emailVerified: session.user.emailVerified,
            role: (token.role ?? "USER") as "USER" | "ADMIN",
          };
        } else {
          // ensure required properties exist and are typed
          modifiedSession.user.id = token.id as string;
          modifiedSession.user.name = token.name ?? modifiedSession.user.name;
          modifiedSession.user.email =
            token.email ?? modifiedSession.user.email;
          modifiedSession.user.role = (token.role ??
            modifiedSession.user.role) as "USER" | "ADMIN";
          modifiedSession.user.emailVerified =
            modifiedSession.user.emailVerified ?? false;
          // modifiedSession.user.image = (token as any).image ?? modifiedSession.user.image ?? null;
        }
      }
      return modifiedSession;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/sign-up",
  },
};
