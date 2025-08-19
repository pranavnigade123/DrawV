import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar"

export default async function ArchivedTournamentsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== "admin") redirect("/")

  return (
    <>
      <AdminToolbar title="Archived Tournaments" />
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 p-6">
        <p className="text-sm text-zinc-500">No archived tournaments.</p>
      </div>
    </>
  )
}
