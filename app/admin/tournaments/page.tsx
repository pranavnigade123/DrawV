import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import Link from "next/link"
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar"

export default async function ManageTournamentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== "admin") redirect("/")

  return (
    <>
      <AdminToolbar title="Manage Tournaments" />
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60">
        <div className="grid grid-cols-12 bg-zinc-50 dark:bg-zinc-900/60 text-xs text-zinc-500 px-4 py-2 rounded-t-2xl border-b border-zinc-200/70 dark:border-zinc-800/70">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Game</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-1 text-right">Action</div>
        </div>
        <div className="px-4 py-6 text-sm text-zinc-500">
          No tournaments yet. <Link href="/admin/tournaments/create" className="text-indigo-600 hover:underline">Create one</Link>.
        </div>
      </div>
    </>
  )
}
