import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { DefaultSession, NextAuthOptions, User } from "next-auth";
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
    async jwt({ token }) {

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
        });

        if (dbUser) {
          token.id = String(dbUser.id);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
      }

      return session;
    },
  },
} satisfies NextAuthOptions;

export default authOptions;
