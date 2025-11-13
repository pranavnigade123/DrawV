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
}

interface BracketViewerProps {
  bracketId: string;
  matches?: Match[];
  isEditable?: boolean;
}

export default function BracketViewer({
  bracketId,
  matches: initialMatches,
  isEditable = true,
}: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [updating, setUpdating] = useState<string | null>(null);
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    }
  }, [bracketId]);

  useEffect(() => {
    if (!initialMatches) fetchBracket();
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

  function groupByRound(matches: Match[], type: "W" | "L" | "F") {
    const filtered = matches.filter((m) => m.bracket === type);
    const byRound: Record<number, Match[]> = {};
    filtered.forEach((m) => {
      byRound[m.round] = byRound[m.round] || [];
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
        ref={(el) => { matchRefs.current[m.id] = el; }}
        className={`border rounded-lg bg-zinc-900 p-3 shadow-lg w-[240px] ${
          m.bracket === "F" ? 'border-indigo-500' : m.bracket === "L" ? 'border-orange-500/40' : 'border-zinc-700'
        }`}
      >
        <div className="text-[10px] text-zinc-500 mb-2 font-mono">{m.id}</div>
        <div className={`flex justify-between items-center px-3 py-2 rounded mb-1 ${
          winner === "A" ? "bg-emerald-600/30 border border-emerald-500/60" : "bg-zinc-800/60"
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "A" && <span className="text-emerald-400">✓</span>}
            <span className={`text-sm truncate ${winner === "A" ? "text-white font-bold" : "text-zinc-300"}`}>
              {m.opponentA?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input type="number" min={0} className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
              value={scoreA} onChange={(e) => setScoreA(e.target.value)} placeholder="-" />
          ) : (
            <span className="text-sm text-zinc-400 font-mono">{m.scoreA ?? "-"}</span>
          )}
        </div>
        <div className={`flex justify-between items-center px-3 py-2 rounded ${
          winner === "B" ? "bg-emerald-600/30 border border-emerald-500/60" : "bg-zinc-800/60"
        }`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {winner === "B" && <span className="text-emerald-400">✓</span>}
            <span className={`text-sm truncate ${winner === "B" ? "text-white font-bold" : "text-zinc-300"}`}>
              {m.opponentB?.label || "TBD"}
            </span>
          </div>
          {isEditable ? (
            <input type="number" min={0} className="w-14 text-center text-sm bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white focus:border-indigo-500 focus:outline-none"
              value={scoreB} onChange={(e) => setScoreB(e.target.value)} placeholder="-" />
          ) : (
            <span className="text-sm text-zinc-400 font-mono">{m.scoreB ?? "-"}</span>
          )}
        </div>
        {isEditable && (
          <button onClick={() => handleUpdateScore(m.id, Number(scoreA), Number(scoreB))} disabled={updating === m.id}
            className={`mt-3 w-full text-xs py-2 rounded font-semibold ${
              updating === m.id ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}>
            {updating === m.id ? "Saving..." : "Save Result"}
          </button>
        )}
      </div>
    );
  }

  const MATCH_HEIGHT = 140;
  const ROUND_GAP = 100;
  const CONNECTOR_WIDTH = 50;

  // Draw canvas connectors
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = container.scrollWidth;
    canvas.height = container.scrollHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connectors for winner bracket
    winners.forEach((round, roundIdx) => {
      if (roundIdx >= winners.length - 1) return; // Skip last round

      round.matches.forEach((match, matchIdx) => {
        const matchEl = matchRefs.current[match.id];
        if (!matchEl) return;

        const matchRect = matchEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Calculate positions relative to canvas
        const x1 = matchRect.right - containerRect.left + container.scrollLeft;
        const y1 = matchRect.top + matchRect.height / 2 - containerRect.top + container.scrollTop;

        // Draw horizontal line from match
        ctx.strokeStyle = '#52525b'; // zinc-600
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + CONNECTOR_WIDTH, y1);
        ctx.stroke();

        // Connect pairs of matches
        if (matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length) {
          const nextMatch = round.matches[matchIdx + 1];
          const nextMatchEl = matchRefs.current[nextMatch.id];
          if (!nextMatchEl) return;

          const nextMatchRect = nextMatchEl.getBoundingClientRect();
          const y2 = nextMatchRect.top + nextMatchRect.height / 2 - containerRect.top + container.scrollTop;

          // Vertical line connecting the two matches
          const midX = x1 + CONNECTOR_WIDTH;
          ctx.beginPath();
          ctx.moveTo(midX, y1);
          ctx.lineTo(midX, y2);
          ctx.stroke();

          // Horizontal line to next round
          const midY = (y1 + y2) / 2;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + CONNECTOR_WIDTH, midY);
          ctx.stroke();
        }
      });
    });

    // Draw connectors for loser bracket
    losers.forEach((round, roundIdx) => {
      if (roundIdx >= losers.length - 1) return;

      round.matches.forEach((match, matchIdx) => {
        const matchEl = matchRefs.current[match.id];
        if (!matchEl) return;

        const matchRect = matchEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const x1 = matchRect.right - containerRect.left + container.scrollLeft;
        const y1 = matchRect.top + matchRect.height / 2 - containerRect.top + container.scrollTop;

        // Draw horizontal line
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)'; // orange-500/40
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + CONNECTOR_WIDTH, y1);
        ctx.stroke();

        // Connect pairs
        if (matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length) {
          const nextMatch = round.matches[matchIdx + 1];
          const nextMatchEl = matchRefs.current[nextMatch.id];
          if (!nextMatchEl) return;

          const nextMatchRect = nextMatchEl.getBoundingClientRect();
          const y2 = nextMatchRect.top + nextMatchRect.height / 2 - containerRect.top + container.scrollTop;

          const midX = x1 + CONNECTOR_WIDTH;
          ctx.beginPath();
          ctx.moveTo(midX, y1);
          ctx.lineTo(midX, y2);
          ctx.stroke();

          const midY = (y1 + y2) / 2;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(midX + CONNECTOR_WIDTH, midY);
          ctx.stroke();
        }
      });
    });
  }, [matches, winners, losers]);

  return (
    <div ref={containerRef} className="overflow-x-auto pb-8 bg-zinc-950 relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />
      <div className="flex gap-24 p-8 min-w-max relative" style={{ zIndex: 1 }}>
        {/* Winner Bracket */}
        {winners.map((r, roundIdx) => {
          const verticalGap = MATCH_HEIGHT * Math.pow(2, roundIdx);
          
          return (
            <div key={`W${r.round}`} className="flex flex-col relative">
              <div className="text-sm font-bold text-zinc-300 mb-6 px-2 h-8">
                Round {r.round}
              </div>
              
              <div className="flex flex-col relative" style={{ gap: `${verticalGap}px` }}>
                {r.matches.map((m) => (
                  <div key={m.id} className="relative">
                    <MatchCard m={m} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Finals */}
        {finals.length > 0 && (
          <div className="flex flex-col">
            <div className="text-sm font-bold text-indigo-400 mb-6 px-2 h-8">🏆 Finals</div>
            <div className="flex flex-col gap-8">
              {finals.map((m) => <MatchCard key={m.id} m={m} />)}
            </div>
          </div>
        )}

        {/* Loser Bracket */}
        {losers.length > 0 && (
          <div className="border-l-2 border-orange-500/30 pl-20 ml-10">
            <div className="text-sm font-bold text-orange-400 mb-6 px-2 h-8">Loser&apos;s Bracket</div>
            <div className="flex gap-24">
              {losers.map((r, roundIdx) => {
                const verticalGap = MATCH_HEIGHT * Math.pow(2, Math.floor(roundIdx / 2));
                
                return (
                  <div key={`L${r.round}`} className="flex flex-col relative">
                    <div className="text-xs font-semibold text-zinc-400 mb-6 px-2 h-8">LB R{r.round}</div>
                    <div className="flex flex-col relative" style={{ gap: `${verticalGap}px` }}>
                      {r.matches.map((m) => (
                        <div key={m.id} className="relative">
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
      </div>
    </div>
  );
}
