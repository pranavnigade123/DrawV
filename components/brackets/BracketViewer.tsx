"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * BracketViewer Component
 * Shows full bracket with rounds, supports score entry + winner highlight
 */

/* -----------------------------
   🧱 Types
----------------------------- */

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
}

interface BracketViewerProps {
  bracketId: string;
  matches?: Match[];
  isEditable?: boolean;
}

/* -----------------------------
   🧩 Component
----------------------------- */

export default function BracketViewer({
  bracketId,
  matches: initialMatches,
  isEditable = true,
}: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [updating, setUpdating] = useState<string | null>(null);

  /** 🔹 Fetch bracket only if matches aren't provided */
  const fetchBracket = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/brackets/${bracketId}`);
      const data = await res.json();

      if (!res.ok || !data?.matches) {
        toast.error(data?.error || "Failed to load bracket");
        console.error("Invalid bracket response:", data);
        return;
      }

      setMatches(data.matches || []);
    } catch (err) {
      toast.error("Failed to load bracket");
      console.error(err);
    }
  }, [bracketId]);

  /** 🔹 Initial data load */
  useEffect(() => {
    if (!initialMatches) {
      fetchBracket();
    }
  }, [initialMatches, fetchBracket]);

  /** 🔹 Update match result & refresh */
async function handleUpdateScore(matchId: string, scoreA: number, scoreB: number) {
  try {
    setUpdating(matchId);

    const res = await fetch(`/api/brackets/${bracketId}/resolve-result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, scoreA, scoreB }),
    });

    const text = await res.text();
    let data: { error?: string } = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      console.warn("⚠️ Non-JSON response from API:", text);
      data = { error: text };
    }

    if (!res.ok) {
      const msg = data.error || `Failed to update score (${res.status})`;
      throw new Error(msg);
    }

    toast.success("Result updated!");
    fetchBracket();
  } catch (err: unknown) {
    console.error("⚠️ Score update error:", err);
    const errorMessage = err instanceof Error ? err.message : "Error updating score";
    toast.error(errorMessage);
  } finally {
    setUpdating(null);
  }
}


  /* -----------------------------
     🔹 Group matches by type/round
  ----------------------------- */
  function group(matches: Match[], type: "W" | "L" | "F") {
    const filtered = matches.filter((m) => m.bracket === type);
    const byRound: Record<number, Match[]> = {};
    filtered.forEach((m) => {
      byRound[m.round] = byRound[m.round] || [];
      byRound[m.round].push(m);
    });
    return Object.entries(byRound)
      .map(([r, ms]) => ({ round: Number(r), matches: ms }))
      .sort((a, b) => a.round - b.round);
  }

  const winners = group(matches, "W");
  const losers = group(matches, "L");
  const finals = matches.filter((m) => m.bracket === "F");

  /* -----------------------------
     🧱 Match Card
  ----------------------------- */
  function MatchCard({ m }: { m: Match }) {
    const [scoreA, setScoreA] = useState<number | string>(m.scoreA ?? "");
    const [scoreB, setScoreB] = useState<number | string>(m.scoreB ?? "");

    const winner =
      m.finished && m.winner === "A"
        ? "A"
        : m.finished && m.winner === "B"
        ? "B"
        : null;

    const isLoserBracket = m.bracket === "L";
    const isFinal = m.bracket === "F";

    return (
      <div 
        className={`relative border rounded-lg bg-zinc-900/90 p-3 shadow-md min-w-[200px] z-10 transition-all ${
          isFinal 
            ? 'border-indigo-500/50 shadow-indigo-500/20' 
            : isLoserBracket 
            ? 'border-orange-500/30' 
            : 'border-zinc-700'
        } ${m.finished ? 'shadow-lg' : ''}`}
      >
        <div className="text-[10px] text-zinc-500 mb-2 font-mono">{m.id}</div>

        {/* Team A */}
        <div
          className={`flex justify-between items-center px-3 py-2 rounded transition-colors ${
            winner === "A" 
              ? "bg-emerald-600/30 border border-emerald-500/50" 
              : "bg-zinc-800/50 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "A" && (
              <span className="text-emerald-400 text-xs">✓</span>
            )}
            <span className={`text-sm truncate ${
              winner === "A" ? "text-white font-semibold" : "text-zinc-300"
            }`}>
              {m.opponentA?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input
              type="number"
              min={0}
              max={100}
              className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-white outline-none focus:border-indigo-500"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              placeholder="-"
            />
          ) : (
            <span className="text-sm text-zinc-400 font-mono min-w-[24px] text-right">
              {m.scoreA ?? "-"}
            </span>
          )}
        </div>

        {/* Team B */}
        <div
          className={`flex justify-between items-center px-3 py-2 rounded mt-1 transition-colors ${
            winner === "B" 
              ? "bg-emerald-600/30 border border-emerald-500/50" 
              : "bg-zinc-800/50 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "B" && (
              <span className="text-emerald-400 text-xs">✓</span>
            )}
            <span className={`text-sm truncate ${
              winner === "B" ? "text-white font-semibold" : "text-zinc-300"
            }`}>
              {m.opponentB?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input
              type="number"
              min={0}
              max={100}
              className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-1 py-1 text-white outline-none focus:border-indigo-500"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              placeholder="-"
            />
          ) : (
            <span className="text-sm text-zinc-400 font-mono min-w-[24px] text-right">
              {m.scoreB ?? "-"}
            </span>
          )}
        </div>

        {/* Save Button */}
        {isEditable && (
          <button
            onClick={() => handleUpdateScore(m.id, Number(scoreA), Number(scoreB))}
            disabled={updating === m.id}
            className={`mt-3 w-full text-xs py-2 rounded font-medium transition-all ${
              updating === m.id
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95"
            }`}
          >
            {updating === m.id ? "Saving..." : "Save Result"}
          </button>
        )}
      </div>
    );
  }

  /* -----------------------------
     🧾 Layout with Connectors
  ----------------------------- */
  return (
    <div className="overflow-x-auto mt-2 pb-4">
      <style jsx>{`
        .bracket-round {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          min-height: 100%;
        }
        
        .match-wrapper {
          position: relative;
          margin: 12px 0;
        }
        
        /* Connector lines */
        .connector-line {
          position: absolute;
          background: #3f3f46;
          z-index: 0;
        }
        
        .connector-horizontal {
          height: 2px;
          left: 100%;
          top: 50%;
          transform: translateY(-1px);
        }
        
        .connector-vertical {
          width: 2px;
          left: 100%;
        }
        
        .connector-winner {
          background: #10b981;
        }
        
        .connector-loser {
          background: #f59e0b;
        }
        
        /* Match spacing for better visual flow */
        .round-1 .match-wrapper { margin: 8px 0; }
        .round-2 .match-wrapper { margin: 24px 0; }
        .round-3 .match-wrapper { margin: 56px 0; }
        .round-4 .match-wrapper { margin: 120px 0; }
      `}</style>

      <div className="flex gap-16 items-center">
        {/* Winner Bracket */}
        <div className="flex gap-16">
          {winners.map((r, roundIdx) => {
            const matchHeight = 100;
            const spacing = Math.pow(2, roundIdx) * 40;
            
            return (
              <div key={`W${r.round}`} className={`bracket-round round-${r.round}`}>
                <div className="text-xs font-semibold text-zinc-400 mb-4 px-2">
                  Round {r.round}
                </div>
                <div className="flex flex-col" style={{ gap: `${spacing}px` }}>
                  {r.matches.map((m, matchIdx) => (
                    <div key={m.id} className="match-wrapper relative">
                      {/* Horizontal connector to next round */}
                      {roundIdx < winners.length - 1 && (
                        <div 
                          className={`connector-line connector-horizontal ${
                            m.finished ? 'connector-winner' : ''
                          }`}
                          style={{ width: '64px' }}
                        />
                      )}
                      
                      {/* Vertical connector between pairs */}
                      {matchIdx % 2 === 0 && matchIdx + 1 < r.matches.length && (
                        <div
                          className="connector-line connector-vertical"
                          style={{
                            top: '50%',
                            height: `${spacing + matchHeight}px`,
                            left: 'calc(100% + 64px)',
                          }}
                        />
                      )}
                      
                      <MatchCard m={m} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Loser Bracket */}
        {losers.length > 0 && (
          <div className="flex gap-16 border-l-2 border-zinc-800 pl-16">
            <div className="text-xs font-semibold text-orange-400 mb-4">
              Loser&apos;s Bracket
            </div>
            <div className="flex gap-16">
              {losers.map((r, roundIdx) => {
                const spacing = Math.pow(2, Math.floor(roundIdx / 2)) * 40;
                
                return (
                  <div key={`L${r.round}`} className={`bracket-round round-${r.round}`}>
                    <div className="text-xs font-semibold text-zinc-400 mb-4 px-2">
                      LB R{r.round}
                    </div>
                    <div className="flex flex-col" style={{ gap: `${spacing}px` }}>
                      {r.matches.map((m, matchIdx) => (
                        <div key={m.id} className="match-wrapper relative">
                          {/* Horizontal connector */}
                          {roundIdx < losers.length - 1 && (
                            <div 
                              className={`connector-line connector-horizontal connector-loser ${
                                m.finished ? 'opacity-100' : 'opacity-40'
                              }`}
                              style={{ width: '64px' }}
                            />
                          )}
                          
                          {/* Vertical connector */}
                          {matchIdx % 2 === 0 && matchIdx + 1 < r.matches.length && (
                            <div
                              className="connector-line connector-vertical connector-loser opacity-40"
                              style={{
                                top: '50%',
                                height: `${spacing + 100}px`,
                                left: 'calc(100% + 64px)',
                              }}
                            />
                          )}
                          
                          <MatchCard m={m} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Finals */}
        {finals.length > 0 && (
          <div className="flex flex-col gap-6 border-l-2 border-indigo-600 pl-16">
            <div className="text-xs font-semibold text-indigo-400 mb-2">Grand Finals</div>
            {finals.map((m) => (
              <div key={m.id} className="match-wrapper">
                <MatchCard m={m} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
