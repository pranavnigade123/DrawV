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
        if (!credentials?.email || !credentials.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!validPassword) return null;

        return {
          id: String((user as any)._id ?? (user as any).id),
          email: user.email,
          name: user.name,
      
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {

    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            await User.create({
              email: user.email,
              name: user.name,
              provider: account.provider,
              role: "player", // default role
            });
          }
        }
        return true;
      } catch (e) {
        console.error("NextAuth signIn error:", e);
        return false;
      }
    },


    async jwt({ token, user }) {

      if (user?.id && !token.id) {
        token.id = user.id as string;
      }

      if (token.role && token.id) {
        return token;
      }

      // If role or id are missing but we have an email, fetch once from DB
      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            token.role = dbUser.role || "player";
            
            token.id = (dbUser as any)._id?.toString?.() ?? String((dbUser as any)._id ?? "");
          }
        } catch (e) {
          console.error("NextAuth jwt error:", e);
        }
      }

      return token;
    },

   
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
};
