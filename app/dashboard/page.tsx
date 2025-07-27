'use client'
import { useSession, signOut } from "next-auth/react"
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()

  // If user navigates to /dashboard but is not logged in, redirect to custom /login page.
  useEffect(() => {
    if (status === "unauthenticated") {
      // You can change the text below if you want to use e.g. toast/alert/etc.
      router.replace(`/login?callbackUrl=/dashboard`)
    }
  }, [status, router])

  // Optional: if redirecting above, you may skip showing the prompt below; otherwise keep for slow network fallback.
  if (status === "loading")
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );

  // While redirecting unauthenticated users above, this fallback will never actually show.
  if (!session)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="mb-4 text-lg font-semibold">You must be signed in to view the dashboard.</p>
        <button
          className="px-5 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          onClick={() => router.push('/login?callbackUrl=/dashboard')}
        >
          Sign In
        </button>
      </div>
    )

  return (
    <main className="min-h-[85vh] max-w-2xl mx-auto py-8 px-2 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Welcome, {session.user?.name || session.user?.email}!
        </h1>
        <button
          className="px-4 py-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-200 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-800 transition"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </button>
      </div>
      <div className="bg-white/90 dark:bg-zinc-900/80 p-6 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-lg mb-2">Dashboard Features</h2>
        <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-300">
          <li>Track your tournaments, matches, and standings.</li>
          <li>Register for events directly.</li>
          <li>Live bracket and results (coming soon).</li>
        </ul>
      </div>
    </main>
  )
}
