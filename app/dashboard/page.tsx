'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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

      {/* Dashboard features */}
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

      {/* My Registrations */}
      <div className="bg-white/90 dark:bg-zinc-900/80 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-lg mb-3">My Registrations</h2>
        <UserRegistrations />
      </div>
    </main>
  )
}

/* Client-side fetcher for the user's registrations list */
function UserRegistrations() {
  const [items, setItems] = useState<any[] | null>(null)
  const [err, setErr] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/me/registrations", { cache: "no-store" })
        const data = await res.json()
        if (!active) return
        if (!res.ok) setErr(data?.error || "Failed to load registrations")
        else setItems(data.items || [])
      } catch {
        if (active) setErr("Network error")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  if (loading) return <p className="text-sm text-zinc-400">Loading...</p>
  if (err) return <p className="text-sm text-rose-400">{err}</p>
  if (!items || items.length === 0) return <p className="text-sm text-zinc-400">No registrations yet.</p>

  return (
    <ul className="text-sm text-zinc-300 space-y-2">
      {items.map((r) => (
        <li key={r._id} className="flex items-center justify-between">
          <span>
            {r.tournamentName} • {r.entryType === "team" ? (r.team?.name || "Team") : "Solo"}
          </span>
          <span className={[
            "font-mono px-2 py-0.5 rounded",
            r.status === "approved" ? "bg-emerald-900/30 text-emerald-300" :
            r.status === "pending" ? "bg-amber-900/30 text-amber-300" :
            r.status === "rejected" ? "bg-rose-900/30 text-rose-300" :
            "bg-zinc-800 text-zinc-300"
          ].join(" ")}>
            {r.status}
          </span>
        </li>
      ))}
    </ul>
  )
}
