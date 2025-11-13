import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import Tournament from "@/lib/models/Tournament";
import Link from "next/link";
import BracketViewer from "@/components/brackets/BracketViewer";

export default async function AdminBracketViewPage({
  params,
}: {
  params: Promise<{ bracketId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/");
  }

  const { bracketId } = await params;

  await connectDB();

  const bracket = await Bracket.findOne({ bracketId }).lean();
  if (!bracket) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-4">Bracket Not Found</h1>
          <Link href="/admin/tournaments" className="text-indigo-400 hover:underline">
            ← Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  // Find associated tournament
  const tournament = await Tournament.findOne({ bracketId }).lean();

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={tournament ? `/admin/tournaments/${tournament._id}/manage` : "/admin/tournaments"}
            className="text-indigo-400 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to {tournament ? "Tournament Management" : "Tournaments"}
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {tournament ? tournament.name : "Bracket Viewer"}
          </h1>
          <p className="text-zinc-400 mt-1">
            Bracket ID: <span className="font-mono text-sm">{bracketId}</span>
          </p>
        </div>

        {/* Bracket Viewer */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Edit Bracket</h2>
          <BracketViewer 
            bracketId={bracketId} 
            matches={(bracket as any).matches}
            isEditable={true}
          />
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-sm text-zinc-400">Format</div>
            <div className="text-lg font-semibold text-white capitalize">
              {(bracket as any).format?.replace("_", " ") || "N/A"}
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-sm text-zinc-400">Participants</div>
            <div className="text-lg font-semibold text-white">
              {(bracket as any).participantsCount || 0}
            </div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="text-sm text-zinc-400">Total Matches</div>
            <div className="text-lg font-semibold text-white">
              {(bracket as any).matches?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
