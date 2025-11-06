// /types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      role?: string
      name?: string | null
      email?: string | null
      image?: string | null
      ign?: string | null
      phone?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role?: string
    name?: string | null
    email?: string | null
    image?: string | null
    ign?: string | null
    phone?: string | null
  }
}
