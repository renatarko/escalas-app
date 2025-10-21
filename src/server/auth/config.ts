import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       // ...other properties
//       role: "USER" | "ADMIN";
//     } & DefaultSession["user"];
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

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
        // Não permite login se não há credenciais
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided");
          return null;
        }

        console.log({ credentials });

        // Busca usuário no banco
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("nao encontrou user no banco?", !user);

        // Se usuário não existe ou não tem senha, rejeita
        if (!user) {
          console.log("User not found, creating...");
          const newUser = await db.user.create({
            data: {
              name: "",
              email: credentials.email as string,
              password: await bcrypt.hash(credentials.password as string, 10),
              whatsapp: "",
              role: "USER",
            },
          });

          console.log("User created:", newUser);
          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image ?? null,
          };
        }

        // Verifica senha
        if (!user.password) {
          console.log("User has no password set");
          // usuário existe mas não tem senha (ex.: criado via OAuth) — rejeita login por credenciais
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          console.log("Invalid password");
          return null;
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
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 days
  },
  adapter: PrismaAdapter(db),
  // Ative debug para mais logs
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const modifiedSession = { ...session };
      if (token) {
        if (!session.user) modifiedSession.user = {};
        modifiedSession.user.id = token.id;
        modifiedSession.user.name = token.name;
        modifiedSession.user.email = token.email;
        modifiedSession.user.image = token.image;
        modifiedSession.user.role = token.role;
      }
      return modifiedSession;
    },
    signIn: async () => {
      return true;
    },
    // session: ({ session, user }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
  },
  pages: {
    signIn: "/auth/sign-in",
    newUser: "/auth/sign-up",
  },
};
