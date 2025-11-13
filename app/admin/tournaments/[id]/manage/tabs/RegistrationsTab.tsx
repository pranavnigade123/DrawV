"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Registration {
  _id: string;
  entryType: "solo" | "team";
  status: "pending" | "approved" | "rejected";
  solo?: {
    name: string | null;
    ign: string;
    email: string;
    phone?: string | null;
  };
  team?: {
    name: string;
    leader: {
      name: string | null;
      email: string;
      ign: string;
      phone?: string | null;
    };
    members: Array<{
      name: string;
      email: string;
      ign: string;
    }>;
  };
  createdAt: string;
}

export default function RegistrationsTab({ tournament }: { tournament: any }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, [tournament._id]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/registrations`);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (registrationId: string, newStatus: "approved" | "rejected") => {
    setUpdating(registrationId);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      await fetchRegistrations();
      toast.success(`Registration ${newStatus}!`);
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration");
    } finally {
      setUpdating(null);
    }
  };

  const filteredRegistrations = registrations
    .filter((reg) => filter === "all" || reg.status === filter)
    .filter((reg) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      if (reg.entryType === "solo") {
        return (
          reg.solo?.name?.toLowerCase().includes(query) ||
          reg.solo?.ign.toLowerCase().includes(query) ||
          reg.solo?.email.toLowerCase().includes(query)
        );
      } else {
        return (
          reg.team?.name.toLowerCase().includes(query) ||
          reg.team?.leader.name?.toLowerCase().includes(query) ||
          reg.team?.leader.email.toLowerCase().includes(query)
        );
      }
    });

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    approved: registrations.filter((r) => r.status === "approved").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400">Loading registrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total" count={counts.all} color="blue" />
        <StatCard title="Pending" count={counts.pending} color="yellow" />
        <StatCard title="Approved" count={counts.approved} color="green" />
        <StatCard title="Rejected" count={counts.rejected} color="red" />
      </div>

      {/* Filters and Search */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, IGN, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Registrations ({filteredRegistrations.length})
        </h3>

        {filteredRegistrations.length === 0 ? (
          <p className="text-zinc-400 text-center py-8">No registrations found</p>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => (
              <RegistrationCard
                key={reg._id}
                registration={reg}
                onStatusUpdate={handleStatusUpdate}
                updating={updating === reg._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, count, color }: { title: string; count: number; color: string }) {
  const colorClasses = {
    blue: "bg-blue-900/20 border-blue-800/50 text-blue-400",
    yellow: "bg-yellow-900/20 border-yellow-800/50 text-yellow-400",
    green: "bg-emerald-900/20 border-emerald-800/50 text-emerald-400",
    red: "bg-red-900/20 border-red-800/50 text-red-400",
  };

  return (
    <div className={`border rounded-xl p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-sm opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
    </div>
  );
}

function RegistrationCard({
  registration,
  onStatusUpdate,
  updating,
}: {
  registration: Registration;
  onStatusUpdate: (id: string, status: "approved" | "rejected") => void;
  updating: boolean;
}) {
  const statusColors = {
    pending: "bg-yellow-900/20 border-yellow-800/50 text-yellow-400",
    approved: "bg-emerald-900/20 border-emerald-800/50 text-emerald-400",
    rejected: "bg-red-900/20 border-red-800/50 text-red-400",
  };

  const statusIcons = {
    pending: <ClockIcon className="w-4 h-4" />,
    approved: <CheckCircleIcon className="w-4 h-4" />,
    rejected: <XCircleIcon className="w-4 h-4" />,
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {registration.entryType === "solo" ? (
            <div>
              <h4 className="text-white font-semibold">{registration.solo?.name}</h4>
              <p className="text-sm text-zinc-400">IGN: {registration.solo?.ign}</p>
              <p className="text-sm text-zinc-500">{registration.solo?.email}</p>
              {registration.solo?.phone && (
                <p className="text-sm text-zinc-500">{registration.solo.phone}</p>
              )}
            </div>
          ) : (
            <div>
              <h4 className="text-white font-semibold">{registration.team?.name}</h4>
              <p className="text-sm text-zinc-400">
                Leader: {registration.team?.leader.name || registration.team?.leader.ign}
              </p>
              <p className="text-sm text-zinc-500">{registration.team?.leader.email}</p>
              <p className="text-sm text-zinc-500 mt-1">
                Members: {registration.team?.members.length || 0}
              </p>
            </div>
          )}
          <p className="text-xs text-zinc-600 mt-2">
            Registered: {new Date(registration.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
              statusColors[registration.status]
            }`}
          >
            {statusIcons[registration.status]}
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </span>

          {registration.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onStatusUpdate(registration._id, "approved")}
                disabled={updating}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => onStatusUpdate(registration._id, "rejected")}
                disabled={updating}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {registration.entryType === "team" && registration.team?.members && (
        <details className="mt-3">
          <summary className="text-sm text-indigo-400 cursor-pointer hover:text-indigo-300">
            View team members ({registration.team.members.length})
          </summary>
          <div className="mt-2 pl-4 space-y-1">
            {registration.team.members.map((member, index) => (
              <div key={index} className="text-sm text-zinc-400">
                • {member.name} ({member.ign}) - {member.email}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
