import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/models/mongodb";
import Tournament from "@/lib/models/Tournament";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar"; 
function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 hover:border-indigo-600/40 transition-all duration-200">
      <div className="text-xs font-medium text-zinc-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value ?? "—"}</div>
      {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/");
  }

  const firstName = (session.user.name ?? "Admin").split(" ")[0];

  // ✅ Connect to MongoDB and fetch tournament counts
  await connectDB();
  const counts = {
    draft: await Tournament.countDocuments({ status: "draft" }),
    open: await Tournament.countDocuments({ status: "open" }),
    ongoing: await Tournament.countDocuments({ status: "ongoing" }),
    completed: await Tournament.countDocuments({ status: "completed" }),
  };

  return (
    <div className="px-6 pb-10 bg-black min-h-screen text-white">
      {/* ✅ Upper Toolbar for managing tournaments */}
      <AdminToolbar title="Admin Dashboard" />

      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 items-start mt-6">
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

          {/* Hero Banner */}
          <div className="mt-6 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
            <div className="p-6 sm:p-8">
              <div className="text-sm opacity-90">Admin Panel</div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">
                Welcome, {firstName}! Manage tournaments efficiently.
              </h2>
              <p className="mt-2 text-sm text-indigo-100 max-w-2xl">
                Create events, control registrations, and oversee matches—all from one place.
              </p>
            </div>
          </div>

          {/* Quick Access Buttons */}
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

          {/* Tournament Stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard title="Drafts" value={counts.draft} sub="Tournaments in draft" />
            <StatCard title="Open" value={counts.open} sub="Open for registration" />
            <StatCard title="Ongoing" value={counts.ongoing} sub="Currently running" />
            <StatCard title="Completed" value={counts.completed} sub="Finished events" />
          </div>

          {/* Continue Managing Section */}
          <div className="mt-10">
            <div className="text-sm font-medium text-zinc-500 mb-3">
              Continue Managing
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <ManageCard
                title="Set rules and format"
                sub="Tournament"
                href="/admin/tournaments/create"
                linkText="Configure →"
              />
              <ManageCard
                title="Open/close window"
                sub="Registrations"
                href="/admin/tournaments"
                linkText="Manage →"
              />
              <ManageCard
                title="Seed and schedule"
                sub="Brackets"
                href="/admin/tournaments"
                linkText="Open →"
              />
            </div>
          </div>

          {/* Recent Tournaments Table */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-500">
                Recent Tournaments
              </div>
              <Link
                href="/admin/tournaments"
                className="text-sm text-indigo-400 hover:underline"
              >
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
  );
}

function ManageCard({
  title,
  sub,
  href,
  linkText,
}: {
  title: string;
  sub: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden hover:border-indigo-600/40 transition-all duration-200">
      <div className="h-24 bg-zinc-800/60" />
      <div className="p-4">
        <div className="text-sm text-zinc-500">{sub}</div>
        <div className="font-semibold mt-1 text-white">{title}</div>
        <div className="mt-3">
          <Link href={href} className="text-indigo-400 hover:underline text-sm">
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
