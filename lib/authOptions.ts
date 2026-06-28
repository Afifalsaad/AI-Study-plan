import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { DefaultSession, NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import { loginUser } from "@/actions/server/auth";
import { prisma } from "./prisma";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const userInfo = await loginUser({
          email,
          password,
        });

        if (!userInfo) {
          return null;
        }

        return {
          id: userInfo.id.toString(),
          name: userInfo.name,
          email: userInfo.email,
        };
      },
    }),
    GoogleProvider({
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    }),
    GitHubProvider({
      clientId: getRequiredEnv("GITHUB_ID"),
      clientSecret: getRequiredEnv("GITHUB_SECRET"),
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: user.email!,
        },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: user.name!,
            email: user.email!,
            image: user.image,
            provider: account?.provider,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
      }

      if (!token?.email) {
        return token;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
        });

        if (dbUser) {
          token.id = String(dbUser.id);
        } else {
          // User was deleted from DB — invalidate the session
          return null as unknown as JWT;
        }
      } catch (error) {
        console.error("Prisma error in jwt callback on session check:", error);
        // Fall back to existing token to prevent logging out on DB connection issues
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      } else {
        // No valid user ID — return null to clear the session
        return null as unknown as Session;
      }
      return session;
    },
  },
} satisfies NextAuthOptions;

export default authOptions;
