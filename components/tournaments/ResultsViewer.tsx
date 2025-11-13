"use client";

import { useEffect, useState } from "react";
import { TrophyIcon } from "@heroicons/react/24/outline";

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
  placement: number;
}

interface ResultsViewerProps {
  bracketId: string;
  showChampion?: boolean;
}

export default function ResultsViewer({ bracketId, showChampion = false }: ResultsViewerProps) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [champion, setChampion] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch(`/api/brackets/${bracketId}`);
        const data = await res.json();
        if (data.matches) {
          calculateStandings(data.matches);
          checkTournamentComplete(data.matches);
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
      } finally {
        setLoading(false);
      }
    }

    if (bracketId) {
      fetchResults();
    }
  }, [bracketId]);

  const checkTournamentComplete = (allMatches: Match[]) => {
    // Check if all real matches (excluding BYEs) are finished
    const matchesWithParticipants = allMatches.filter((m) => {
      if (!m.opponentA.label || !m.opponentB.label) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    });
    
    const finishedMatches = allMatches.filter((m) => {
      if (!m.finished) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    });
    
    const complete = matchesWithParticipants.length > 0 && 
                     finishedMatches.length === matchesWithParticipants.length;
    
    setIsComplete(complete);

    // Find champion only if tournament is complete
    if (complete) {
      // Find the final match (highest round in main bracket)
      const mainBracketMatches = allMatches.filter((m) => m.bracket === "main");
      const finalMatch = mainBracketMatches.reduce((highest, current) => {
        return current.round > highest.round ? current : highest;
      }, mainBracketMatches[0]);

      if (finalMatch && finalMatch.finished) {
        const championName = finalMatch.winner === "A" 
          ? finalMatch.opponentA.label 
          : finalMatch.opponentB.label;
        setChampion(championName);
      }
    }
  };

  const calculateStandings = (allMatches: Match[]) => {
    const stats: Record<string, { wins: number; losses: number; matchesPlayed: number }> = {};

    allMatches
      .filter((m) => {
        // Must be finished with both opponents
        if (!m.finished || !m.opponentA.label || !m.opponentB.label) return false;
        
        // Exclude BYE matches
        const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
        return !isByeMatch;
      })
      .forEach((match) => {
        const teamA = match.opponentA.label!;
        const teamB = match.opponentB.label!;

        if (!stats[teamA]) stats[teamA] = { wins: 0, losses: 0, matchesPlayed: 0 };
        if (!stats[teamB]) stats[teamB] = { wins: 0, losses: 0, matchesPlayed: 0 };

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

    const standingsArray = Object.entries(stats)
      .map(([participant, data]) => ({
        participant,
        ...data,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      })
      .map((standing, index) => ({
        ...standing,
        placement: index + 1,
      }));

    setStandings(standingsArray);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-zinc-400">Loading results...</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="text-center py-8">
        <TrophyIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">No matches completed yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tournament Status */}
      {!isComplete && (
        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
          <p className="text-blue-300 text-sm">
            ⚠️ Tournament is still in progress. Standings will update as matches are completed.
          </p>
        </div>
      )}

      {/* Champion - Only show if tournament is complete AND showChampion is true */}
      {showChampion && isComplete && champion && (
        <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border border-yellow-800/50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <TrophyIcon className="w-12 h-12 text-yellow-500" />
            <div>
              <h3 className="text-xl font-bold text-yellow-500">Tournament Champion</h3>
              <p className="text-2xl font-bold text-white mt-1">{champion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {isComplete ? "Final Standings" : "Current Standings"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Participant</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Wins</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">Losses</th>
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
                        {standing.placement === 1 && <span className="text-xl">🥇</span>}
                        {standing.placement === 2 && <span className="text-xl">🥈</span>}
                        {standing.placement === 3 && <span className="text-xl">🥉</span>}
                        <span className="text-white font-medium">#{standing.placement}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{standing.participant}</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-semibold">
                      {standing.wins}
                    </td>
                    <td className="py-3 px-4 text-center text-red-400 font-semibold">
                      {standing.losses}
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-300">{winRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
