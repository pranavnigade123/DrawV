// app/admin/dashboard/page.tsx
// Dashboard inspired by the provided design, adapted to your admin content.
// Assumes TailwindCSS is available.

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import Link from "next/link"

function StatCard({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-4">
      <div className="text-xs font-medium text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
    </div>
  )
}

function ActionButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
    >
      {label}
    </Link>
  )
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/")
  }

  const firstName = (session.user.name ?? "Admin").split(" ")[0]

  return (
    <div className="px-6 pb-10">
      {/* Top row: search + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        <div className="xl:col-span-3">
          {/* Search + quick links */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tournaments, users..."
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  ⌘K
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <ActionButton href="/admin/tournaments/create" label="Create Tournament" />
              <ActionButton href="/admin/tournaments" label="Manage" />
              <ActionButton href="/admin/tournaments/archived" label="Archived" />
            </div>
          </div>

          {/* Hero banner */}
          <div className="mt-6 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-500 text-white">
            <div className="p-6 sm:p-8">
              <div className="text-sm opacity-90">Admin Panel</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
                Welcome, {firstName}! Manage tournaments efficiently.
              </h2>
              <p className="mt-2 text-sm/relaxed text-indigo-100 max-w-2xl">
                Create events, control registrations, and oversee matches—all from one place.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/admin/tournaments/create"
                  className="px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium hover:bg-indigo-50 transition"
                >
                  New Tournament
                </Link>
                <Link
                  href="/admin/tournaments"
                  className="px-4 py-2 rounded-lg border border-white/80 text-white hover:bg-white/10 transition"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>

          {/* Pills (quick status) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Drafts" value="—" sub="Tournaments in draft" />
            <StatCard title="Open" value="—" sub="Open for registration" />
            <StatCard title="Ongoing" value="—" sub="Currently running" />
            <StatCard title="Completed" value="—" sub="Finished events" />
          </div>

          {/* Continue managing (cards) */}
          <div className="mt-8">
            <div className="text-sm font-medium text-zinc-500 mb-3">Continue Managing</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-200/60 dark:bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Tournament</div>
                  <div className="font-semibold mt-1">Set rules and format</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments/create" className="text-indigo-600 hover:underline text-sm">
                      Configure →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-200/60 dark:bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Registrations</div>
                  <div className="font-semibold mt-1">Open/close window</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments" className="text-indigo-600 hover:underline text-sm">
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-200/60 dark:bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Brackets</div>
                  <div className="font-semibold mt-1">Seed and schedule</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments" className="text-indigo-600 hover:underline text-sm">
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your lesson-like table (adapted to recent tournaments) */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-500">Recent Tournaments</div>
              <Link href="/admin/tournaments" className="text-sm text-indigo-600 hover:underline">
                See all
              </Link>
            </div>

            <div className="mt-3 rounded-xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800/70">
              <div className="grid grid-cols-12 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 px-4 py-2">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Game</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Dates</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {/* Empty state row (replace with real data later) */}
              <div className="px-4 py-6 text-sm text-zinc-500">
                No tournaments yet. Create your first one.
              </div>
            </div>
          </div>
        </div>

        {/* Right column widgets */}
        <div className="xl:col-span-1">
          {/* Profile widget */}
          <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-5">
            <div className="text-sm text-zinc-500">Welcome</div>
            <div className="mt-1 font-semibold text-lg">{firstName} 👋</div>
            <div className="mt-2 text-xs text-zinc-500">
              Continue building great events today.
            </div>

            {/* Simple progress bars placeholder */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Setup completion</span>
                  <span>0%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-indigo-600" style={{ width: "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Active events</span>
                  <span>0</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: "0%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-5">
            <div className="text-sm font-medium text-zinc-500 mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/tournaments/create" className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                New
              </Link>
              <Link href="/admin/tournaments" className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                Manage
              </Link>
              <Link href="/admin/tournaments/archived" className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                Archived
              </Link>
              <Link href="/admin/users" className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
                Users
              </Link>
            </div>
          </div>

          {/* Tips widget */}
          <div className="mt-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-5">
            <div className="text-sm font-medium text-zinc-500 mb-2">Tips</div>
            <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
              <li>Draft tournaments early and open registrations later.</li>
              <li>Duplicate past events to reuse formats quickly.</li>
              <li>Archive completed events to keep lists tidy.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
