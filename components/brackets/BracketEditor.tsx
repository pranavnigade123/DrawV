"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Match {
  id: string;
  bracket: string;
  round: number;
  matchNumber: number;
  opponentA: {
    type: string;
    label: string | null;
    refId: string | null;
    propagatedFrom?: string | null;
  };
  opponentB: {
    type: string;
    label: string | null;
    refId: string | null;
    propagatedFrom?: string | null;
  };
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
  winnerto?: string | null;
  loserto?: string | null;
  metadata?: any;
}

interface BracketEditorProps {
  bracketId: string;
}

export default function BracketEditor({ bracketId }: BracketEditorProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBracket() {
      try {
        const res = await fetch(`/api/brackets/${bracketId}`);
        if (!res.ok) throw new Error("Failed to load bracket");
        
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (bracketId) {
      fetchBracket();
    }
  }, [bracketId]);

  const propagateWinner = (updatedMatches: Match[], matchId: string) => {
    const match = updatedMatches.find((m) => m.id === matchId);
    if (!match || !match.finished || !match.winner) return updatedMatches;

    const winnerData = match.winner === "A" ? match.opponentA : match.opponentB;
    const loserData = match.winner === "A" ? match.opponentB : match.opponentA;

    // Propagate winner to next match
    if (match.winnerto) {
      const nextMatch = updatedMatches.find((m) => m.id === match.winnerto);
      if (nextMatch) {
        // Determine which slot (A or B) the winner should go to
        const slot = match.matchNumber % 2 === 1 ? "opponentA" : "opponentB";
        nextMatch[slot] = {
          ...winnerData,
          propagatedFrom: match.id,
        };
      }
    }

    // Propagate loser to loser bracket (double elimination)
    if (match.loserto) {
      const loserMatch = updatedMatches.find((m) => m.id === match.loserto);
      if (loserMatch) {
        const loserSlot = (match.metadata as any)?.loserExpectedSlot || "A";
        const targetSlot = loserSlot === "A" ? "opponentA" : "opponentB";
        loserMatch[targetSlot] = {
          ...loserData,
          propagatedFrom: match.id,
        };
      }
    }

    return updatedMatches;
  };

  const updateMatchScore = (matchId: string, scoreA: number, scoreB: number) => {
    let updatedMatches = matches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            scoreA,
            scoreB,
            winner: (scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null) as "A" | "B" | null,
            finished: scoreA !== null && scoreB !== null && scoreA !== scoreB,
          }
        : m
    );

    // Propagate winner if match is finished
    const match = updatedMatches.find((m) => m.id === matchId);
    if (match?.finished) {
      updatedMatches = propagateWinner(updatedMatches, matchId);
    }

    setMatches(updatedMatches);
  };

  const saveChanges = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/brackets/${bracketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      router.refresh();
      alert("Changes saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-zinc-400">Click on a match to edit scores</p>
        <button
          onClick={saveChanges}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

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
                  className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 min-w-[250px]"
                >
                  <div className="text-xs text-zinc-500 mb-2">Match {match.matchNumber}</div>
                  
                  {editingMatch === match.id ? (
                    <div className="space-y-2">
                      {/* Editing Mode */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white flex-1 truncate">
                          {match.opponentA.label || "TBD"}
                        </span>
                        <input
                          type="number"
                          value={match.scoreA ?? ""}
                          onChange={(e) =>
                            updateMatchScore(
                              match.id,
                              parseInt(e.target.value) || 0,
                              match.scoreB ?? 0
                            )
                          }
                          className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-center"
                          placeholder="0"
                        />
                      </div>

                      <div className="text-center text-xs text-zinc-600">vs</div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white flex-1 truncate">
                          {match.opponentB.label || "TBD"}
                        </span>
                        <input
                          type="number"
                          value={match.scoreB ?? ""}
                          onChange={(e) =>
                            updateMatchScore(
                              match.id,
                              match.scoreA ?? 0,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-center"
                          placeholder="0"
                        />
                      </div>

                      <button
                        onClick={() => setEditingMatch(null)}
                        className="w-full mt-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setEditingMatch(match.id)}
                      className="cursor-pointer space-y-1"
                    >
                      {/* View Mode */}
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
                          <span className="text-sm font-bold text-white ml-2">
                            {match.scoreA}
                          </span>
                        )}
                      </div>

                      <div className="text-center text-xs text-zinc-600">vs</div>

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
                          <span className="text-sm font-bold text-white ml-2">
                            {match.scoreB}
                          </span>
                        )}
                      </div>

                      {match.finished && (
                        <div className="mt-2 text-xs text-center text-emerald-400">
                          Finished
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
