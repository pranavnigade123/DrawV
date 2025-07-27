import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// ---
// The key improvement: export authOptions for getServerSession (e.g. in /admin/dashboard)
// ---

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
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
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
    // 1. Ensure OAuth users are in the DB (with a role: "player" by default)
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              provider: account.provider,
              role: "player", // Default; can be promoted manually
            });
          }
        }
        return true;
      } catch (err) {
        console.error("SignIn callback error:", err);
        return false;
      }
    },

    // 2. Attach .role and .id to the session -- fetch fresh from Mongo each time
    async session({ session, token }) {
      await connectDB();
      if (session.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.role = dbUser.role || "player";
          session.user.id = dbUser._id.toString();
          // Optionally also include provider if useful:
          // session.user.provider = dbUser.provider;
        } else {
          session.user.role = undefined;
          session.user.id = undefined;
        }
      }
      return session;
    },

    // 3. Attach role/id to token during login for completeness (supports JWT mode)
    async jwt({ token, user, account }) {
      if (user) {
        // On login only (credentials or OAuth) — attaches role/id if present
        token.id = user.id;
        if (typeof (user as any).role !== "undefined") {
          token.role = (user as any).role;
        }
      }
      return token;
    },
  },
  // pages:{ ... } // Optional: custom signIn/error pages if desired
  // session: { strategy: ... } // Optional: customize session strategy
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
