"use client";

import { useEffect, useState } from "react";

interface Match {
  id: string;
  bracket: string;
  round: number;
  matchNumber: number;
  opponentA: {
    type: string;
    label: string | null;
  };
  opponentB: {
    type: string;
    label: string | null;
  };
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
}

interface BracketDisplayProps {
  bracketId: string;
  tournamentSlug: string;
}

export default function BracketDisplay({ bracketId, tournamentSlug }: BracketDisplayProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBracket() {
      try {
        console.log("Fetching bracket:", bracketId);
        const res = await fetch(`/api/brackets/${bracketId}`);
        console.log("Response status:", res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to load bracket");
        }
        
        const data = await res.json();
        console.log("Bracket data:", data);
        setMatches(data.matches || []);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (bracketId) {
      fetchBracket();
    } else {
      setError("No bracket ID provided");
      setLoading(false);
    }
  }, [bracketId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-zinc-400">Loading bracket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No matches found</p>
      </div>
    );
  }

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const sortedRounds = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max p-4">
        {sortedRounds.map((roundNum) => (
          <div key={roundNum} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-zinc-300 text-center mb-2">
              Round {roundNum}
            </h3>
            {rounds[roundNum].map((match) => (
              <div
                key={match.id}
                className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 min-w-[200px]"
              >
                <div className="text-xs text-zinc-500 mb-2">Match {match.matchNumber}</div>
                
                {/* Opponent A */}
                <div
                  className={`flex items-center justify-between p-2 rounded ${
                    match.winner === "A"
                      ? "bg-emerald-900/30 border border-emerald-700"
                      : "bg-zinc-800/50"
                  }`}
                >
                  <span className="text-sm text-white truncate">
                    {match.opponentA.label || "TBD"}
                  </span>
                  {match.scoreA !== null && (
                    <span className="text-sm font-bold text-white ml-2">{match.scoreA}</span>
                  )}
                </div>

                <div className="text-center text-xs text-zinc-600 my-1">vs</div>

                {/* Opponent B */}
                <div
                  className={`flex items-center justify-between p-2 rounded ${
                    match.winner === "B"
                      ? "bg-emerald-900/30 border border-emerald-700"
                      : "bg-zinc-800/50"
                  }`}
                >
                  <span className="text-sm text-white truncate">
                    {match.opponentB.label || "TBD"}
                  </span>
                  {match.scoreB !== null && (
                    <span className="text-sm font-bold text-white ml-2">{match.scoreB}</span>
                  )}
                </div>

                {match.finished && (
                  <div className="mt-2 text-xs text-center text-emerald-400">Finished</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
