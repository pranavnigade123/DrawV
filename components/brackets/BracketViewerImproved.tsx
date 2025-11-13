"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

interface Opponent {
  type: "team" | "player" | "placeholder";
  label?: string | null;
}

interface Match {
  id: string;
  bracket: "W" | "L" | "F";
  round: number;
  matchNumber: number;
  opponentA: Opponent;
  opponentB: Opponent;
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
  winnerto?: string | null;
}

interface BracketViewerProps {
  bracketId: string;
  matches?: Match[];
  isEditable?: boolean;
}

export default function BracketViewerImproved({
  bracketId,
  matches: initialMatches,
  isEditable = true,
}: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [updating, setUpdating] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchBracket = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/brackets/${bracketId}`);
      const data = await res.json();

      if (!res.ok || !data?.matches) {
        toast.error(data?.error || "Failed to load bracket");
        return;
      }

      setMatches(data.matches || []);
    } catch (err) {
      toast.error("Failed to load bracket");
      console.error(err);
    }
  }, [bracketId]);

  useEffect(() => {
    if (!initialMatches) {
      fetchBracket();
    }
  }, [initialMatches, fetchBracket]);

  async function handleUpdateScore(matchId: string, scoreA: number, scoreB: number) {
    try {
      setUpdating(matchId);

      const res = await fetch(`/api/brackets/${bracketId}/resolve-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, scoreA, scoreB }),
      });

      if (!res.ok) throw new Error("Failed to update score");

      toast.success("Result updated!");
      fetchBracket();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating score");
    } finally {
      setUpdating(null);
    }
  }

  function groupByRound(matches: Match[], bracketType: "W" | "L" | "F") {
    const filtered = matches.filter((m) => m.bracket === bracketType);
    const byRound: Record<number, Match[]> = {};
    
    filtered.forEach((m) => {
      if (!byRound[m.round]) byRound[m.round] = [];
      byRound[m.round].push(m);
    });

    return Object.entries(byRound)
      .map(([r, ms]) => ({ round: Number(r), matches: ms.sort((a, b) => a.matchNumber - b.matchNumber) }))
      .sort((a, b) => a.round - b.round);
  }

  const winners = groupByRound(matches, "W");
  const losers = groupByRound(matches, "L");
  const finals = matches.filter((m) => m.bracket === "F");

  function MatchCard({ m }: { m: Match }) {
    const [scoreA, setScoreA] = useState<number | string>(m.scoreA ?? "");
    const [scoreB, setScoreB] = useState<number | string>(m.scoreB ?? "");

    const winner = m.finished && m.winner === "A" ? "A" : m.finished && m.winner === "B" ? "B" : null;

    return (
      <div 
        className={`relative border rounded-lg bg-zinc-900 p-3 shadow-lg min-w-[220px] transition-all ${
          m.bracket === "F" 
            ? 'border-indigo-500 shadow-indigo-500/30' 
            : m.bracket === "L"
            ? 'border-orange-500/40'
            : 'border-zinc-700'
        }`}
      >
        <div className="text-[10px] text-zinc-500 mb-2 font-mono">{m.id}</div>

        {/* Team A */}
        <div
          className={`flex justify-between items-center px-3 py-2 rounded mb-1 transition-all ${
            winner === "A" 
              ? "bg-emerald-600/30 border border-emerald-500/60" 
              : "bg-zinc-800/60 border border-zinc-700/50"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "A" && <span className="text-emerald-400 text-sm">✓</span>}
            <span className={`text-sm truncate ${winner === "A" ? "text-white font-bold" : "text-zinc-300"}`}>
              {m.opponentA?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input
              type="number"
              min={0}
              className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              placeholder="-"
            />
          ) : (
            <span className="text-sm text-zinc-400 font-mono">{m.scoreA ?? "-"}</span>
          )}
        </div>

        {/* Team B */}
        <div
          className={`flex justify-between items-center px-3 py-2 rounded transition-all ${
            winner === "B" 
              ? "bg-emerald-600/30 border border-emerald-500/60" 
              : "bg-zinc-800/60 border border-zinc-700/50"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "B" && <span className="text-emerald-400 text-sm">✓</span>}
            <span className={`text-sm truncate ${winner === "B" ? "text-white font-bold" : "text-zinc-300"}`}>
              {m.opponentB?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input
              type="number"
              min={0}
              className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              placeholder="-"
            />
          ) : (
            <span className="text-sm text-zinc-400 font-mono">{m.scoreB ?? "-"}</span>
          )}
        </div>

        {/* Save Button */}
        {isEditable && (
          <button
            onClick={() => handleUpdateScore(m.id, Number(scoreA), Number(scoreB))}
            disabled={updating === m.id}
            className={`mt-3 w-full text-xs py-2 rounded font-semibold transition-all ${
              updating === m.id
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md"
            }`}
          >
            {updating === m.id ? "Saving..." : "Save Result"}
          </button>
        )}
      </div>
    );
  }

  // Calculate match spacing based on round
  const getMatchSpacing = (roundIndex: number) => {
    return Math.pow(2, roundIndex) * 60;
  };

  return (
    <div className="overflow-x-auto pb-8" ref={containerRef}>
      <div className="inline-flex gap-20 p-8 min-w-full">
        {/* Winner Bracket */}
        {winners.map((round, roundIdx) => {
          const spacing = getMatchSpacing(roundIdx);
          
          return (
            <div key={`W-R${round.round}`} className="relative flex flex-col">
              {/* Round Header */}
              <div className="text-sm font-bold text-zinc-300 mb-6 px-2 sticky top-0 bg-zinc-950/80 backdrop-blur py-2 rounded">
                Round {round.round}
              </div>

              {/* Matches */}
              <div className="flex flex-col justify-around flex-1" style={{ gap: `${spacing}px` }}>
                {round.matches.map((match, matchIdx) => (
                  <div key={match.id} className="relative">
                    <MatchCard m={match} />
                    
                    {/* Connector to next round */}
                    {roundIdx < winners.length - 1 && (
                      <svg
                        className="absolute left-full top-1/2 pointer-events-none"
                        width="80"
                        height={spacing + 100}
                        style={{ transform: 'translateY(-50%)' }}
                      >
                        {/* Horizontal line from match */}
                        <line
                          x1="0"
                          y1={spacing / 2 + 50}
                          x2="40"
                          y2={spacing / 2 + 50}
                          stroke={match.finished ? "#10b981" : "#52525b"}
                          strokeWidth="2"
                        />
                        
                        {/* Vertical line connecting pairs */}
                        {matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length && (
                          <>
                            <line
                              x1="40"
                              y1={spacing / 2 + 50}
                              x2="40"
                              y2={spacing + spacing / 2 + 50}
                              stroke="#52525b"
                              strokeWidth="2"
                            />
                            {/* Horizontal line to next round */}
                            <line
                              x1="40"
                              y1={spacing + 50}
                              x2="80"
                              y2={spacing + 50}
                              stroke="#52525b"
                              strokeWidth="2"
                            />
                          </>
                        )}
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Finals */}
        {finals.length > 0 && (
          <div className="relative flex flex-col">
            <div className="text-sm font-bold text-indigo-400 mb-6 px-2">
              🏆 Finals
            </div>
            <div className="flex flex-col gap-8">
              {finals.map((match) => (
                <MatchCard key={match.id} m={match} />
              ))}
            </div>
          </div>
        )}

        {/* Loser Bracket */}
        {losers.length > 0 && (
          <div className="border-l-2 border-orange-500/30 pl-20 ml-20">
            <div className="text-sm font-bold text-orange-400 mb-6 px-2">
              Loser's Bracket
            </div>
            <div className="flex gap-20">
              {losers.map((round, roundIdx) => {
                const spacing = getMatchSpacing(roundIdx);
                
                return (
                  <div key={`L-R${round.round}`} className="relative flex flex-col">
                    <div className="text-xs font-semibold text-zinc-400 mb-6 px-2">
                      LB Round {round.round}
                    </div>
                    <div className="flex flex-col justify-around flex-1" style={{ gap: `${spacing}px` }}>
                      {round.matches.map((match) => (
                        <MatchCard key={match.id} m={match} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
