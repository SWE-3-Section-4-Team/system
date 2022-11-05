import NextAuth, { User, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from 'argon2';
// Prisma adapter for NextAuth, optional and can be removed
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  session: {
    strategy: 'jwt',
    maxAge: 3000,
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.user = user;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user = token.user as User;
      return session;
    }
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "pin", type: "text", placeholder: "Personal Identification Number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: {
            pin: credentials.username,
          },
        });
        if (!user) {
          throw new Error("Invalid credentials");
        }
        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user.id,
          name: user.name,
          role: user.role,
        };
      }
    }),
  ],
};

export default NextAuth(authOptions);
