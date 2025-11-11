// app/admin/brackets/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar";
import { connectDB } from "@/lib/models/mongodb";
import Bracket from "@/lib/models/Brackets";
import Link from "next/link";

export default async function AdminBracketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") redirect("/");

  await connectDB();
  const items = await Bracket.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <AdminToolbar title="Brackets" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Saved Brackets</h2>
            <Link href="/admin/tournaments" className="text-indigo-400 hover:underline">Back to tournaments</Link>
          </div>

          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-zinc-400">No brackets saved yet.</div>
            ) : (
              <ul className="divide-y divide-zinc-800/60">
                {items.map((b: any) => (
                  <li key={b.bracketId} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{b.bracketId} • {b.format}</div>
                      <div className="text-xs text-zinc-400">{b.participantsCount} teams • {b.matches?.length ?? 0} matches</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {b.tournamentId ? <div className="text-xs text-zinc-400">Tournament</div> : null}
                      <Link href={`/admin/brackets/${b.bracketId}`} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">View</Link>
                      <form action={async () => { /* implement admin delete server action if desired */ }}>
                        <button type="button" className="px-3 py-1 border rounded text-sm border-zinc-700 text-zinc-200">Delete</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
