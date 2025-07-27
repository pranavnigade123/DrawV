'use client'
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="w-full px-4 py-3 bg-white dark:bg-black shadow flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          DRAW V
        </Link>
        <Link href="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
        <Link href="/public-tools" className="hover:text-indigo-600 transition">Tools</Link>
        <Link href="/tournaments" className="hover:text-indigo-600 transition">Tournaments</Link>
        <Link href="/about" className="hover:text-indigo-600 transition">About</Link>
        <Link href="/contact" className="hover:text-indigo-600 transition">Contact</Link>
      </div>
      <div>
        {status === "authenticated" ? (
          <div className="flex items-center gap-3">
            <span className="text-zinc-600 dark:text-zinc-300">{session.user?.name || session.user?.email}</span>
            <button
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </button>
          </div>
        ) : status === "loading" ? (
          <span className="text-zinc-400">...</span>
        ) : (
          <>
            <Link href="/login" className="px-3 py-1 rounded hover:bg-indigo-100 text-indigo-600 font-semibold mr-2">Sign In</Link>
            <Link href="/register" className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
