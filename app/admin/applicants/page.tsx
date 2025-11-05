"use client";

import { useEffect, useState } from "react";
import AdminToolbar from "@/app/admin/admin-ui/AdminToolbar";

export default function ApplicantsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState("All");

  useEffect(() => {
  const fetchApplicants = async () => {
    try {
      const res = await fetch("/api/applicants");
      const data = await res.json();

      // Sort registrations by game
      const sorted = [...data].sort((a, b) =>
        (a.tournamentId?.game || "").localeCompare(b.tournamentId?.game || "")
      );
      setRegistrations(sorted);

      // ✅ Extract unique games for dropdown (fully typed)
      const gamesFromData: string[] = data
        .map((r: any) => r.tournamentId?.game as string)
        .filter((g: string): g is string => typeof g === "string" && g.trim().length > 0);

      const uniqueGames: string[] = [
        "All",
        ...Array.from(new Set<string>(gamesFromData)),
      ];

      setGames(uniqueGames);
    } catch (err) {
      console.error("Error fetching applicants:", err);
    }
  };

  fetchApplicants();
}, []);

  // Filter registrations by selected game
  const filtered =
    selectedGame === "All"
      ? registrations
      : registrations.filter((r) => r.tournamentId?.game === selectedGame);

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <AdminToolbar title="Tournament Applicants" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">
            Tournament Applicants
          </h2>

          {/* 🎮 Sorting Dropdown */}
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {games.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Applicants Table */}
        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/60 p-6 overflow-x-auto">
          <table className="w-full text-sm text-left text-zinc-300">
            <thead className="text-xs uppercase text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Entry Type</th>
                <th className="py-3 px-4">Tournament</th>
                <th className="py-3 px-4">Game</th>
                <th className="py-3 px-4">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((r: any, i: number) => {
                  const isTeam = r.entryType === "team";
                  const applicantName = isTeam
                    ? r.team?.name || r.team?.leader?.name || "Unnamed Team"
                    : r.solo?.name || "Unknown Player";

                  const applicantEmail = isTeam
                    ? r.team?.leader?.email || "—"
                    : r.solo?.email || "—";

                  return (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">{applicantName}</td>
                      <td className="py-3 px-4">{applicantEmail}</td>
                      <td className="py-3 px-4 capitalize">{r.entryType}</td>
                      <td className="py-3 px-4">
                        {r.tournamentId?.name || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {r.tournamentId?.game || "—"}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-500">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
