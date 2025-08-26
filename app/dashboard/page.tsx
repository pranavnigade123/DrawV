'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace('/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  // Handle corrupt/missing session (defensive sign out)
  useEffect(() => {
    if (status === "authenticated" && (!session || !session.user?.role)) {
      signOut({ callbackUrl: "/login" })
    }
  }, [status, session])

  // If the user is an admin, redirect to admin dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/admin/dashboard")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // If not authenticated, or while redirecting, render nothing
  if (
    status === "unauthenticated"
    || !session
    || !session.user?.role
    || session.user.role !== "player"
  ) {
    return null
  }

  return (
    <main className="min-h-[85vh] max-w-2xl mx-auto py-8 px-2 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-30">
        <h1 className="text-2xl font-bold">
          Welcome, {session.user?.name || session.user?.email}!
        </h1>
        
      </div>

      

      <div className="bg-white/90 dark:bg-zinc-900/80 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-lg mb-2">Dashboard Features</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
          <li>Track your tournaments, matches, and standings.</li>
          <li>Register for events directly.</li>
          <li>Live bracket and results (coming soon).</li>
        </ul>
        <div className="mt-4 text-sm text-zinc-500">
          Your role: <span className="font-mono">{session.user.role}</span>
        </div>
      </div>
    </main>
  )
}
