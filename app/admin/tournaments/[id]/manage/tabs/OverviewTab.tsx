"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, UserGroupIcon, TrophyIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import EmailComposer from "@/components/admin/EmailComposer";

interface OverviewTabProps {
  tournament: any;
  registrationCounts: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export default function OverviewTab({ tournament, registrationCounts }: OverviewTabProps) {
  const [showEmailComposer, setShowEmailComposer] = useState(false);

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Registrations"
          value={registrationCounts.total}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Pending Approval"
          value={registrationCounts.pending}
          icon={<CalendarIcon className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={registrationCounts.approved}
          icon={<TrophyIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Bracket Status"
          value={tournament.bracketGenerated ? "Generated" : "Not Generated"}
          icon={<Cog6ToothIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Tournament Details */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tournament Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Game" value={tournament.game || "Not specified"} />
          <DetailRow label="Format" value={tournament.format.replace("_", " ")} />
          <DetailRow label="Entry Type" value={tournament.entryType === "team" ? "Team-based" : "Solo"} />
          <DetailRow label="Team Size" value={tournament.teamSize || "N/A"} />
          <DetailRow label="Max Participants" value={tournament.maxParticipants || "Unlimited"} />
          <DetailRow label="Status" value={tournament.status} />
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Important Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Registration Opens" value={formatDate(tournament.registrationOpenAt)} />
          <DetailRow label="Registration Closes" value={formatDate(tournament.registrationCloseAt)} />
          <DetailRow label="Tournament Starts" value={formatDate(tournament.startDate)} />
          <DetailRow label="Tournament Ends" value={formatDate(tournament.endDate)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/tournaments/${tournament._id}/edit`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Edit Tournament
          </Link>
          <Link
            href={`/tournaments/${tournament.slug}`}
            target="_blank"
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            View Public Page
          </Link>
          <button 
            onClick={() => setShowEmailComposer(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            Send Announcement
          </button>

          <EmailComposer
            isOpen={showEmailComposer}
            onClose={() => setShowEmailComposer(false)}
            tournamentId={tournament._id}
            tournamentName={tournament.name}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "yellow" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-900/20 text-blue-400 border-blue-800/50",
    yellow: "bg-yellow-900/20 text-yellow-400 border-yellow-800/50",
    green: "bg-emerald-900/20 text-emerald-400 border-emerald-800/50",
    purple: "bg-purple-900/20 text-purple-400 border-purple-800/50",
  };

  return (
    <div className={`border rounded-xl p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="text-white font-medium capitalize">{value}</div>
    </div>
  );
}
