import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcrypt";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        await connectDB();

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.password) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          sessionVersion: user.sessionVersion ?? 0,
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion ?? 0;
      }

      if (token.id) {
        await connectDB();

        const currentUser = await User.findById(token.id).select(
          "sessionVersion",
        );

        if (!currentUser) {
          return null;
        }

        const currentSessionVersion = currentUser.sessionVersion ?? 0;

        if (token.sessionVersion !== currentSessionVersion) {
          return null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id || !token?.role) {
        return {
          ...session,
          user: undefined as unknown as typeof session.user,
        };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }

      return session;
    },
  },
});
