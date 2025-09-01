import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== "admin") redirect("/")

  return (
    <>
      <AdminToolbar title="Users" />
      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6">
        <p className="text-sm text-zinc-500">Users list will appear here.</p>
      </div>
    </>
  )
}
