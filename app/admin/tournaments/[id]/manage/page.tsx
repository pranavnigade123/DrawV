import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";
import TournamentManagementTabs from "./TournamentManagementTabs";

export default async function TournamentManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    redirect("/");
  }

  const { id } = await params;

  await connectDB();

  const tournamentDoc = await Tournament.findById(id).lean();
  if (!tournamentDoc) {
    redirect("/admin/tournaments");
  }

  // Convert to plain object for client component
  const tournament = {
    ...tournamentDoc,
    _id: tournamentDoc._id.toString(),
    createdAt: tournamentDoc.createdAt?.toISOString(),
    updatedAt: tournamentDoc.updatedAt?.toISOString(),
    registrationOpenAt: tournamentDoc.registrationOpenAt?.toISOString() || null,
    registrationCloseAt: tournamentDoc.registrationCloseAt?.toISOString() || null,
    startDate: tournamentDoc.startDate?.toISOString() || null,
    endDate: tournamentDoc.endDate?.toISOString() || null,
    archivedAt: tournamentDoc.archivedAt?.toISOString() || null,
  };

  // Fetch registration counts
  const registrationCounts = {
    total: await Registration.countDocuments({ tournamentId: tournamentDoc._id }),
    pending: await Registration.countDocuments({
      tournamentId: tournamentDoc._id,
      status: "pending",
    }),
    approved: await Registration.countDocuments({
      tournamentId: tournamentDoc._id,
      status: "approved",
    }),
    rejected: await Registration.countDocuments({
      tournamentId: tournamentDoc._id,
      status: "rejected",
    }),
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] pt-20 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                tournament.status === "open"
                  ? "bg-emerald-900/30 text-emerald-300"
                  : tournament.status === "ongoing"
                  ? "bg-indigo-900/30 text-indigo-300"
                  : tournament.status === "completed"
                  ? "bg-zinc-800 text-zinc-300"
                  : "bg-amber-900/30 text-amber-300"
              }`}
            >
              {tournament.status}
            </span>
          </div>
          <p className="text-zinc-400">
            {tournament.game || "No game specified"} • {tournament.format.replace("_", " ")} •{" "}
            {tournament.entryType === "team" ? "Team-based" : "Solo"}
          </p>
        </div>

        {/* Tabs Component */}
        <TournamentManagementTabs
          tournament={tournament}
          registrationCounts={registrationCounts}
        />
      </div>
    </div>
  );
}
