'use client'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function AuthStatus() {
  const { data: session, status } = useSession()
  if (status === "loading") return null
  if (!session) return (
    <nav className="flex items-center gap-3 p-4">
      <Link href="/login" className="px-3 py-1 rounded hover:bg-indigo-100 text-indigo-600 font-semibold">Sign In</Link>
      <Link href="/register" className="px-3 py-1 rounded hover:bg-indigo-100 text-indigo-600">Register</Link>
    </nav>
  )
  return (
    <nav className="flex items-center gap-3 p-4">
      <span>{session.user?.name || session.user?.email}</span>
      <button
        className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
        onClick={() => signOut({ callbackUrl: "/" })}
      >Sign Out</button>
    </nav>
  )
}
