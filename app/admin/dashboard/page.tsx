import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminDashboardPage() {
  // This runs on the server: check session/role BEFORE rendering the page
  const session = await getServerSession(authOptions)

  // Deny all access if no session, or role is not 'admin'
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/") // Optionally: redirect("/login?unauthorized=1")
  }

  // You may safely show admin-only content below
  return (
    <main className="mx-auto max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">Admin Dashboard</h1>
      <p className="mb-4">👋 Welcome, {session.user.name ?? "Admin"}!</p>
      <div className="space-y-3">
        <div>
          <Link
            className="text-blue-600 hover:underline"
            href="/admin/tournaments"
          >
            Manage Tournaments
          </Link>
        </div>
        <div>
          <Link
            className="text-blue-600 hover:underline"
            href="/admin/users"
          >
            View All Users
          </Link>
        </div>
        {/* Add more admin tools here */}
      </div>
    </main>
  )
}
