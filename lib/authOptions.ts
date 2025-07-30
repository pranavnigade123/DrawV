import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          return null;
        }

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // Runs on sign in
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              provider: account.provider,
              role: "player", // default role
            });
          }
        }
        return true;
      } catch (error) {
        console.error("NextAuth signIn callback error:", error);
        return false;
      }
    },
    // Runs when a session is checked/created
    async session({ session }) {
      await connectDB();

      if (session.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.role = dbUser.role || "player";
          session.user.id = dbUser._id.toString();
        } else {
          session.user.role = undefined;
          session.user.id = undefined;
        }
      }
      return session;
    },
    // Runs on JWT creation/refresh
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if ((user as any).role !== undefined) {
          token.role = (user as any).role;
        }
      }
      return token;
    },
  },
};
