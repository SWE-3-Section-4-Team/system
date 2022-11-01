import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from 'argon2';
// Prisma adapter for NextAuth, optional and can be removed

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
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
        return user;
      }
    }),
  ],
};

export default NextAuth(authOptions);
