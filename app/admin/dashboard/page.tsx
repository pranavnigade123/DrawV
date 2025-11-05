// app/admin/dashboard/page.tsx
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
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4">
      <div className="text-xs font-medium text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
    </div>
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
      {/* Top row */}
      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="col-span-1">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tournaments, users..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/30 text-white placeholder-zinc-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                  ⌘K
                </div>
              </div>
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
            </div>
          </div>

          {/* New dedicated buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              View Users
            </Link>

            <Link
              href="/admin/applicants"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              Tournament Applicants
            </Link>
          </div>

          {/* Stat cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Drafts" value="—" sub="Tournaments in draft" />
            <StatCard title="Open" value="—" sub="Open for registration" />
            <StatCard title="Ongoing" value="—" sub="Currently running" />
            <StatCard title="Completed" value="—" sub="Finished events" />
          </div>

          {/* Continue Managing */}
          <div className="mt-8">
            <div className="text-sm font-medium text-zinc-500 mb-3">Continue Managing</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Tournament</div>
                  <div className="font-semibold mt-1 text-white">Set rules and format</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments/create" className="text-indigo-400 hover:underline text-sm">
                      Configure →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Registrations</div>
                  <div className="font-semibold mt-1 text-white">Open/close window</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments" className="text-indigo-400 hover:underline text-sm">
                      Manage →
                    </Link>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden">
                <div className="h-28 bg-zinc-800/60" />
                <div className="p-4">
                  <div className="text-sm text-zinc-500">Brackets</div>
                  <div className="font-semibold mt-1 text-white">Seed and schedule</div>
                  <div className="mt-3">
                    <Link href="/admin/tournaments" className="text-indigo-400 hover:underline text-sm">
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tournaments Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-500">Recent Tournaments</div>
              <Link href="/admin/tournaments" className="text-sm text-indigo-400 hover:underline">
                See all
              </Link>
            </div>

            <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800/70">
              <div className="grid grid-cols-12 bg-zinc-900/60 text-xs text-zinc-500 px-4 py-2">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Game</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Dates</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="px-4 py-6 text-sm text-zinc-500">
                No tournaments yet. Create your first one.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
