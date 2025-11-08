"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * BracketViewer Component
 * Shows full bracket with rounds, supports score entry + winner highlight
 */

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
  const [bracket, setBracket] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [updating, setUpdating] = useState<string | null>(null);

  /** Fetch bracket from backend only if matches aren't provided */
  async function fetchBracket() {
    try {
      const res = await fetch(`/api/brackets/${bracketId}`);
      const data = await res.json();
      if (res.ok) {
        setBracket(data);
        setMatches(data.matches || []);
      } else {
        toast.error(data.error || "Failed to load bracket");
      }
    } catch (err) {
      toast.error("Failed to load bracket");
      console.error(err);
    }
  }

  useEffect(() => {
    if (!initialMatches) {
      fetchBracket();
    } else {
      setBracket({ matches: initialMatches });
    }
  }, [bracketId, initialMatches]);

  /** Update match result & refresh */
  async function handleUpdateScore(matchId: string, scoreA: number, scoreB: number) {
    try {
      setUpdating(matchId);
      const res = await fetch(`/api/brackets/${bracketId}/resolve-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, scoreA, scoreB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Result updated!");
      fetchBracket(); // refresh latest state
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  }

  if (!bracket) return <p className="text-zinc-400">Loading bracket...</p>;

  /** Group matches by bracket type and round */
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

  /** Match Card */
  function MatchCard({ m }: { m: Match }) {
    const [scoreA, setScoreA] = useState<number | string>(m.scoreA ?? "");
    const [scoreB, setScoreB] = useState<number | string>(m.scoreB ?? "");

    const winner =
      m.finished && m.winner === "A"
        ? "A"
        : m.finished && m.winner === "B"
        ? "B"
        : null;

    return (
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/70 p-2 shadow-sm">
        <div className="text-[11px] text-zinc-500 mb-1">{m.id}</div>

        {/* Team A */}
        <div
          className={`flex justify-between items-center px-2 py-1 rounded ${
            winner === "A" ? "bg-emerald-700/40" : ""
          }`}
        >
          <span className="text-sm text-white">{m.opponentA?.label || "—"}</span>
          {isEditable ? (
            <input
              type="number"
              min={0}
              max={100}
              className="w-12 text-center text-sm bg-transparent border-b border-zinc-600 text-white outline-none"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
            />
          ) : (
            <span className="text-xs text-zinc-400">{m.scoreA ?? ""}</span>
          )}
        </div>

        {/* Team B */}
        <div
          className={`flex justify-between items-center px-2 py-1 rounded mt-1 ${
            winner === "B" ? "bg-emerald-700/40" : ""
          }`}
        >
          <span className="text-sm text-white">{m.opponentB?.label || "—"}</span>
          {isEditable ? (
            <input
              type="number"
              min={0}
              max={100}
              className="w-12 text-center text-sm bg-transparent border-b border-zinc-600 text-white outline-none"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
            />
          ) : (
            <span className="text-xs text-zinc-400">{m.scoreB ?? ""}</span>
          )}
        </div>

        {/* Save Button */}
        {isEditable && (
          <button
            onClick={() => handleUpdateScore(m.id, Number(scoreA), Number(scoreB))}
            disabled={updating === m.id}
            className={`mt-2 w-full text-xs py-1 rounded ${
              updating === m.id
                ? "bg-zinc-700 text-zinc-400"
                : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {updating === m.id ? "Updating..." : "Save Result"}
          </button>
        )}
      </div>
    );
  }

  /** Layout */
  return (
    <div className="overflow-x-auto mt-2">
      <div className="flex gap-8">
        {/* Winner Bracket */}
        <div className="flex gap-6">
          {winners.map((r) => (
            <div key={`W${r.round}`}>
              <div className="text-xs text-zinc-400 mb-2">W R{r.round}</div>
              <div className="space-y-3">
                {r.matches.map((m) => (
                  <MatchCard key={m.id} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loser Bracket */}
        {losers.length > 0 && (
          <div className="flex gap-6">
            {losers.map((r) => (
              <div key={`L${r.round}`}>
                <div className="text-xs text-zinc-400 mb-2">L R{r.round}</div>
                <div className="space-y-3">
                  {r.matches.map((m) => (
                    <MatchCard key={m.id} m={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Finals */}
        {finals.length > 0 && (
          <div className="flex flex-col gap-3 ml-4">
            <div className="text-xs text-zinc-400 mb-2">Finals</div>
            {finals.map((m) => (
              <MatchCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
