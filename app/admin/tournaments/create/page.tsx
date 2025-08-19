import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar"

export default async function CreateTournamentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== "admin") redirect("/")

  return (
    <>
      <AdminToolbar title="Create Tournament" />
      <div className="rounded-2xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60">
        <form action={"/admin/actions-placeholder"} className="p-6 space-y-3">
          <input name="name" placeholder="Name" className="w-full px-3 py-2 border rounded" required />
          <input name="game" placeholder="Game (e.g., Valorant)" className="w-full px-3 py-2 border rounded" />
          <label className="block text-sm">Format</label>
          <select name="format" className="w-full px-3 py-2 border rounded">
            <option value="single_elim">Single Elimination</option>
            <option value="double_elim">Double Elimination</option>
            <option value="round_robin">Round Robin</option>
            <option value="groups_playoffs">Groups + Playoffs</option>
          </select>
          <label className="block text-sm">Entry Type</label>
          <select name="entryType" className="w-full px-3 py-2 border rounded">
            <option value="solo">Solo</option>
            <option value="team">Team</option>
          </select>
          <label className="block text-sm">Registration Open</label>
          <input type="date" name="registrationOpenAt" className="w-full px-3 py-2 border rounded" />
          <label className="block text-sm">Registration Close</label>
          <input type="date" name="registrationCloseAt" className="w-full px-3 py-2 border rounded" />
          <label className="block text-sm">Start Date</label>
          <input type="date" name="startDate" className="w-full px-3 py-2 border rounded" />
          <label className="block text-sm">End Date</label>
          <input type="date" name="endDate" className="w-full px-3 py-2 border rounded" />
          <input type="number" name="maxParticipants" placeholder="Max participants" className="w-full px-3 py-2 border rounded" />
          <input name="coverImage" placeholder="Cover Image URL" className="w-full px-3 py-2 border rounded" />
          <textarea name="rules" placeholder="Rules" className="w-full px-3 py-2 border rounded" />
          <textarea name="description" placeholder="Description" className="w-full px-3 py-2 border rounded" />
          <button className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">Create</button>
        </form>
      </div>
    </>
  )
}
