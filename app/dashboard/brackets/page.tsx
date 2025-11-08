// app/dashboard/brackets/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import Link from "next/link";

export default async function PlayerBracketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="text-center py-20 text-zinc-400">Login to see your saved brackets</div>;

  await connectDB();
  const brackets = await Bracket.find({ ownerId: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-10">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-2xl font-semibold text-white mb-6">My Saved Brackets</h1>
        {brackets.length === 0 ? (
          <div className="text-zinc-400">You haven’t saved any brackets yet.</div>
        ) : (
          <div className="space-y-3">
            {brackets.map((b: any) => (
              <div key={b.bracketId} className="border border-zinc-800/70 bg-zinc-900/60 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{b.format.toUpperCase()} • {b.participantsCount} Teams</div>
                  <div className="text-xs text-zinc-400">Created {new Date(b.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/brackets/${b.bracketId}`} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
