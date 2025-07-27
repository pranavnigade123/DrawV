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

        if (!user || !user.password) return null
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

  callbacks: {
    // Ensures users who login with OAuth are saved to DB with a role field
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "github") {
          await connectDB()
          const existingUser = await User.findOne({ email: user.email })
          if (!existingUser) {
            await User.create({
              email: user.email,
              name: user.name,
              provider: account.provider,
              role: "player" // default role (you can tweak this if needed)
            })
          }
        }
        return true
      } catch (err) {
        console.error("SignIn callback error:", err)
        return false
      }
    },

    // ★ YOU ASKED ABOUT THIS ONE:
    async session({ session, token }) {
  await connectDB()
  if (session.user?.email) {
    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) {
      (session.user as any).role = dbUser.role || "player"; // fallback
      (session.user as any).id = dbUser._id.toString();
    } else {
      // If, for some reason, we can't find the user, fallback to guest/undefined
      (session.user as any).role = undefined;
    }
  }
  return session;
}

}
})

export { handler as GET, handler as POST }
