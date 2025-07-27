import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { connectDB } from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

const handler = NextAuth({
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
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null
        await connectDB()
        const user = await User.findOne({ email: credentials.email })

        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // --- ADD THIS CALLBACK HERE ---
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
  email: user.email,
  name: user.name,
  provider: account.provider, // "google", "github", etc.
});

        }
      }
      return true;
    }
  }
});

export { handler as GET, handler as POST }
