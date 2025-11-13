"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TrophyIcon, ChartBarIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface Match {
  id: string;
  opponentA: { label: string | null };
  opponentB: { label: string | null };
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
  round: number;
  bracket: string;
}

interface Standing {
  participant: string;
  wins: number;
  losses: number;
  matchesPlayed: number;
  placement?: number;
}

export default function ResultsTab({ tournament }: { tournament: any }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (tournament.bracketId) {
      fetchResults();
    }
  }, [tournament.bracketId]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/brackets/${tournament.bracketId}`);
      const data = await res.json();
      if (data.matches) {
        setMatches(data.matches);
        calculateStandings(data.matches);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStandings = (allMatches: Match[]) => {
    const stats: Record<string, { wins: number; losses: number; matchesPlayed: number }> = {};

    // Calculate stats from finished matches (exclude BYE matches)
    allMatches
      .filter((m) => {
        if (!m.finished || !m.opponentA.label || !m.opponentB.label) return false;
        
        // Exclude BYE matches
        const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
        return !isByeMatch;
      })
      .forEach((match) => {
        const teamA = match.opponentA.label!;
        const teamB = match.opponentB.label!;

        // Initialize if not exists
        if (!stats[teamA]) stats[teamA] = { wins: 0, losses: 0, matchesPlayed: 0 };
        if (!stats[teamB]) stats[teamB] = { wins: 0, losses: 0, matchesPlayed: 0 };

        // Update stats
        stats[teamA].matchesPlayed++;
        stats[teamB].matchesPlayed++;

        if (match.winner === "A") {
          stats[teamA].wins++;
          stats[teamB].losses++;
        } else if (match.winner === "B") {
          stats[teamB].wins++;
          stats[teamA].losses++;
        }
      });

    // Convert to array and sort
    const standingsArray = Object.entries(stats)
      .map(([participant, data]) => ({
        participant,
        ...data,
      }))
      .sort((a, b) => {
        // Sort by wins (descending), then by losses (ascending)
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      })
      .map((standing, index) => ({
        ...standing,
        placement: index + 1,
      }));

    setStandings(standingsArray);
  };

  if (!tournament.bracketGenerated) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Results & Standings</h3>
        <p className="text-zinc-400">
          Generate a bracket first to view results and standings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400">Loading results...</p>
      </div>
    );
  }

  // Calculate completion excluding BYE matches
  const totalMatchesCount = matches.filter((m) => {
    if (!m.opponentA.label || !m.opponentB.label) return false;
    
    // Exclude BYE matches
    const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
    return !isByeMatch;
  }).length;
  
  const finishedMatchesCount = matches.filter((m) => {
    if (!m.finished) return false;
    
    // Exclude BYE matches
    const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
    return !isByeMatch;
  }).length;
  
  const completionPercentage = totalMatchesCount > 0 ? Math.round((finishedMatchesCount / totalMatchesCount) * 100) : 0;
  const isComplete = totalMatchesCount > 0 && finishedMatchesCount === totalMatchesCount;

  // Find champion only if tournament is complete
  let champion = null;
  if (isComplete) {
    // Find the final match (highest round in main bracket)
    const mainBracketMatches = matches.filter((m) => m.bracket === "main");
    if (mainBracketMatches.length > 0) {
      const finalMatch = mainBracketMatches.reduce((highest, current) => {
        return current.round > highest.round ? current : highest;
      }, mainBracketMatches[0]);

      if (finalMatch && finalMatch.finished) {
        champion = finalMatch.winner === "A"
          ? finalMatch.opponentA.label
          : finalMatch.opponentB.label;
      }
    }
  }

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !tournament.resultsPublished }),
      });

      if (!res.ok) throw new Error("Failed to update results");

      const data = await res.json();
      toast.success(data.message);
      window.location.reload();
    } catch (error) {
      console.error("Error publishing results:", error);
      toast.error("Failed to update results");
    } finally {
      setPublishing(false);
    }
  };

  const handleExportResults = () => {
    window.open(`/api/admin/tournaments/${tournament._id}/export-results`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Publish Results Control */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Results Management</h3>
            <p className="text-sm text-zinc-400">
              {tournament.resultsPublished
                ? "Results are visible to the public"
                : isComplete
                ? "Results are ready to publish"
                : "Complete all matches before publishing"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportResults}
              disabled={standings.length === 0}
              className="px-4 py-2 rounded-lg font-medium bg-zinc-700 hover:bg-zinc-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleTogglePublish}
              disabled={publishing || standings.length === 0 || (!isComplete && !tournament.resultsPublished)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                tournament.resultsPublished
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={!isComplete && !tournament.resultsPublished ? "Complete all matches first" : ""}
            >
              {publishing
                ? "Updating..."
                : tournament.resultsPublished
                ? "Unpublish Results"
                : "Publish Results"}
            </button>
          </div>
        </div>
      </div>

      {/* Tournament Progress */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          <ChartBarIcon className="w-5 h-5 inline mr-2" />
          Tournament Progress
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Matches Completed</span>
              <span className="text-white font-medium">
                {finishedMatchesCount} / {totalMatchesCount}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-zinc-500">
            {completionPercentage}% Complete
          </div>
        </div>
      </div>

      {/* Tournament Status Warning */}
      {!isComplete && standings.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
          <p className="text-blue-300">
            ⚠️ Tournament is still in progress. Complete all matches before publishing results.
          </p>
        </div>
      )}

      {/* Champion - Only show when tournament is complete */}
      {isComplete && champion && (
        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-800/50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <TrophyIcon className="w-12 h-12 text-yellow-500" />
            <div>
              <h3 className="text-2xl font-bold text-yellow-500">Tournament Champion</h3>
              <p className="text-3xl font-bold text-white mt-1">{champion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Standings */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          <TrophyIcon className="w-5 h-5 inline mr-2" />
          {isComplete ? "Final Standings" : "Current Standings"}
        </h3>

        {standings.length === 0 ? (
          <p className="text-zinc-400">No matches completed yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Participant</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Wins</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Losses</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Matches</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => {
                  const winRate =
                    standing.matchesPlayed > 0
                      ? Math.round((standing.wins / standing.matchesPlayed) * 100)
                      : 0;

                  return (
                    <tr
                      key={standing.participant}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {standing.placement === 1 && (
                            <span className="text-yellow-500 text-xl">🥇</span>
                          )}
                          {standing.placement === 2 && (
                            <span className="text-gray-400 text-xl">🥈</span>
                          )}
                          {standing.placement === 3 && (
                            <span className="text-amber-600 text-xl">🥉</span>
                          )}
                          <span className="text-white font-medium">#{standing.placement}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {standing.participant}
                      </td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                        {standing.wins}
                      </td>
                      <td className="py-3 px-4 text-center text-red-400 font-semibold">
                        {standing.losses}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-300">
                        {standing.matchesPlayed}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-300">
                        {winRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match History */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Match History</h3>

        {finishedMatchesCount === 0 ? (
          <p className="text-zinc-400">No completed matches yet</p>
        ) : (
          <div className="space-y-3">
            {matches
              .filter((m) => {
                if (!m.finished) return false;
                
                // Exclude BYE matches from history
                const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
                return !isByeMatch;
              })
              .sort((a, b) => b.round - a.round)
              .map((match) => (
                <div
                  key={match.id}
                  className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-500">
                      {match.bracket} - Round {match.round}
                    </span>
                    <span className="text-xs text-zinc-600">{match.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div
                      className={`text-right ${
                        match.winner === "A" ? "text-emerald-400 font-semibold" : "text-zinc-400"
                      }`}
                    >
                      {match.opponentA.label}
                      {match.winner === "A" && " 🏆"}
                    </div>
                    <div className="text-center">
                      <span className="text-white font-bold text-lg">
                        {match.scoreA} - {match.scoreB}
                      </span>
                    </div>
                    <div
                      className={`text-left ${
                        match.winner === "B" ? "text-emerald-400 font-semibold" : "text-zinc-400"
                      }`}
                    >
                      {match.winner === "B" && "🏆 "}
                      {match.opponentB.label}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
