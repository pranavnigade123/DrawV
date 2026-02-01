"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

interface Opponent {
  type: "team" | "player" | "placeholder";
  label?: string | null;
  seed?: number | null;
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
  loserto?: string | null;
}

interface BracketViewerProps {
  bracketId: string;
  matches?: Match[];
  isEditable?: boolean;
}

// ============================================================================
// CONSTANTS - Challonge-style dimensions
// ============================================================================

const MATCH_WIDTH = 200;
const MATCH_HEIGHT = 56;
const TEAM_HEIGHT = 28;
const ROUND_GAP = 60;
const VERTICAL_GAP = 16;

// ============================================================================
// SCORE MODAL COMPONENT
// ============================================================================

interface ScoreModalProps {
  match: Match;
  onClose: () => void;
  onSubmit: (scoreA: number, scoreB: number) => void;
  updating: boolean;
}

function ScoreModal({ match, onClose, onSubmit, updating }: ScoreModalProps) {
  const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
  const [winnerA, setWinnerA] = useState(match.winner === "A");
  const [winnerB, setWinnerB] = useState(match.winner === "B");

  const handleWinnerSelect = (side: "A" | "B") => {
    if (side === "A") {
      setWinnerA(true);
      setWinnerB(false);
    } else {
      setWinnerA(false);
      setWinnerB(true);
    }
  };

  const handleSubmit = () => {
    // Ensure winner has higher score
    let finalScoreA = scoreA;
    let finalScoreB = scoreB;
    
    if (winnerA && finalScoreA <= finalScoreB) {
      finalScoreA = finalScoreB + 1;
    } else if (winnerB && finalScoreB <= finalScoreA) {
      finalScoreB = finalScoreA + 1;
    }
    
    onSubmit(finalScoreA, finalScoreB);
  };

  const handleReset = () => {
    setScoreA(0);
    setScoreB(0);
    setWinnerA(false);
    setWinnerB(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-zinc-800 rounded-lg shadow-2xl w-[420px] max-w-[95vw]" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex border-b border-zinc-700">
          <button className="px-6 py-3 text-zinc-400 hover:text-white transition-colors">
            Match Info
          </button>
          <button className="px-6 py-3 text-white font-medium border-b-2 border-cyan-500">
            Report Scores
          </button>
          <button 
            onClick={onClose}
            className="ml-auto px-4 py-3 text-zinc-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Headers */}
          <div className="flex items-center mb-2 text-xs text-zinc-400 uppercase tracking-wider">
            <div className="flex-1"></div>
            <div className="w-20 text-center">Winner</div>
            <div className="w-24 text-center">Score</div>
          </div>

          {/* Team A */}
          <div className={`flex items-center p-3 rounded mb-2 ${winnerA ? 'bg-zinc-700' : 'bg-zinc-900'}`}>
            <div className="flex items-center flex-1 gap-3">
              <span className="text-sm font-medium text-zinc-400 w-6">
                {match.opponentA.seed || "-"}
              </span>
              <span className="text-white font-medium">
                {match.opponentA.label || "TBD"}
              </span>
            </div>
            <button 
              onClick={() => handleWinnerSelect("A")}
              className={`w-20 flex justify-center ${winnerA ? 'text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <div className="w-24 flex items-center justify-center gap-1">
              <input
                type="number"
                min={0}
                value={scoreA}
                onChange={(e) => setScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-center text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex flex-col">
                <button 
                  onClick={() => setScoreA(s => s + 1)}
                  className="text-zinc-400 hover:text-white text-xs leading-none"
                >+</button>
                <button 
                  onClick={() => setScoreA(s => Math.max(0, s - 1))}
                  className="text-zinc-400 hover:text-white text-xs leading-none"
                >-</button>
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className={`flex items-center p-3 rounded mb-4 ${winnerB ? 'bg-zinc-700' : 'bg-zinc-900'}`}>
            <div className="flex items-center flex-1 gap-3">
              <span className="text-sm font-medium text-zinc-400 w-6">
                {match.opponentB.seed || "-"}
              </span>
              <span className="text-white font-medium">
                {match.opponentB.label || "TBD"}
              </span>
            </div>
            <button 
              onClick={() => handleWinnerSelect("B")}
              className={`w-20 flex justify-center ${winnerB ? 'text-cyan-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <div className="w-24 flex items-center justify-center gap-1">
              <input
                type="number"
                min={0}
                value={scoreB}
                onChange={(e) => setScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-center text-white text-sm focus:border-cyan-500 focus:outline-none"
              />
              <div className="flex flex-col">
                <button 
                  onClick={() => setScoreB(s => s + 1)}
                  className="text-zinc-400 hover:text-white text-xs leading-none"
                >+</button>
                <button 
                  onClick={() => setScoreB(s => Math.max(0, s - 1))}
                  className="text-zinc-400 hover:text-white text-xs leading-none"
                >-</button>
              </div>
            </div>
          </div>

          {/* Add Set */}
          <div className="text-right mb-6">
            <button className="text-zinc-400 hover:text-white text-sm">
              + ADD SET
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={updating || (!winnerA && !winnerB)}
              className={`flex-1 py-3 rounded font-semibold transition-colors ${
                updating || (!winnerA && !winnerB)
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500'
              }`}
            >
              {updating ? 'SAVING...' : 'SUBMIT SCORES'}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 text-zinc-400 hover:text-white transition-colors"
            >
              RESET SCORES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MATCH CARD COMPONENT - Challonge style
// ============================================================================

interface MatchCardProps {
  match: Match;
  matchIndex: number;
  onClick?: () => void;
  isEditable: boolean;
}

function MatchCard({ match, matchIndex, onClick, isEditable }: MatchCardProps) {
  const isWinnerA = match.finished && match.winner === "A";
  const isWinnerB = match.finished && match.winner === "B";
  const isFinals = match.bracket === "F";
  const isLoserBracket = match.bracket === "L";

  const getTeamLabel = (opponent: Opponent, slot: "A" | "B") => {
    if (opponent.type === "placeholder") {
      // Check if we can show "Loser of X" or "Winner of X"
      return opponent.label || "TBD";
    }
    return opponent.label || "TBD";
  };

  return (
    <div className="flex items-center">
      {/* Match Number */}
      <div 
        className={`w-7 h-14 flex items-center justify-center text-xs font-medium mr-2 ${
          isLoserBracket ? 'text-zinc-500' : 'text-zinc-500'
        }`}
      >
        {matchIndex}
      </div>

      {/* Match Box */}
      <div 
        className={`relative cursor-pointer transition-all duration-150 hover:brightness-110 ${
          isFinals ? 'ring-1 ring-indigo-500/50' : ''
        }`}
        style={{ width: MATCH_WIDTH }}
        onClick={isEditable ? onClick : undefined}
      >
        {/* Team A */}
        <div 
          className={`flex items-center border-b ${
            isWinnerA 
              ? 'bg-zinc-700 border-zinc-600' 
              : 'bg-zinc-800 border-zinc-700'
          } ${isLoserBracket ? 'bg-opacity-80' : ''}`}
          style={{ height: TEAM_HEIGHT }}
        >
          {/* Seed */}
          <div className={`w-7 flex items-center justify-center text-xs font-medium ${
            isWinnerA ? 'text-yellow-500' : 'text-zinc-500'
          }`}>
            {match.opponentA.seed || ""}
          </div>
          
          {/* Team Name */}
          <div className={`flex-1 px-2 text-sm truncate ${
            isWinnerA ? 'text-white font-medium' : 'text-zinc-300'
          }`}>
            {getTeamLabel(match.opponentA, "A")}
          </div>
          
          {/* Score */}
          <div className={`w-8 flex items-center justify-center text-sm font-medium ${
            isWinnerA ? 'bg-zinc-600 text-white' : 'bg-zinc-900 text-zinc-400'
          }`} style={{ height: TEAM_HEIGHT }}>
            {match.scoreA ?? "-"}
          </div>
        </div>

        {/* Team B */}
        <div 
          className={`flex items-center ${
            isWinnerB 
              ? 'bg-zinc-700' 
              : 'bg-zinc-800'
          } ${isLoserBracket ? 'bg-opacity-80' : ''}`}
          style={{ height: TEAM_HEIGHT }}
        >
          {/* Seed */}
          <div className={`w-7 flex items-center justify-center text-xs font-medium ${
            isWinnerB ? 'text-yellow-500' : 'text-zinc-500'
          }`}>
            {match.opponentB.seed || ""}
          </div>
          
          {/* Team Name */}
          <div className={`flex-1 px-2 text-sm truncate ${
            isWinnerB ? 'text-white font-medium' : 'text-zinc-300'
          }`}>
            {getTeamLabel(match.opponentB, "B")}
          </div>
          
          {/* Score */}
          <div className={`w-8 flex items-center justify-center text-sm font-medium ${
            isWinnerB ? 'bg-zinc-600 text-white' : 'bg-zinc-900 text-zinc-400'
          }`} style={{ height: TEAM_HEIGHT }}>
            {match.scoreB ?? "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BRACKET ROUND COMPONENT
// ============================================================================

interface RoundData {
  round: number;
  matches: Match[];
}

interface BracketRoundProps {
  roundData: RoundData;
  roundIndex: number;
  totalRounds: number;
  bracketType: "W" | "L" | "F";
  matchIndexMap: Map<string, number>;
  onMatchClick: (match: Match) => void;
  isEditable: boolean;
}

function BracketRound({
  roundData,
  roundIndex,
  bracketType,
  matchIndexMap,
  onMatchClick,
  isEditable,
}: BracketRoundProps) {
  // Calculate vertical spacing that doubles each round for proper bracket alignment
  const getVerticalSpacing = () => {
    if (bracketType === "F") return MATCH_HEIGHT + VERTICAL_GAP * 2;
    
    // For losers bracket, spacing increases every 2 rounds
    if (bracketType === "L") {
      const spacingLevel = Math.floor(roundIndex / 2);
      return (MATCH_HEIGHT + VERTICAL_GAP) * Math.pow(2, spacingLevel);
    }
    
    // Winners bracket doubles each round
    return (MATCH_HEIGHT + VERTICAL_GAP) * Math.pow(2, roundIndex);
  };

  const verticalSpacing = getVerticalSpacing();

  return (
    <div className="flex flex-col" style={{ marginLeft: roundIndex > 0 ? ROUND_GAP : 0 }}>
      {/* Round Header */}
      <div className="text-xs font-medium text-zinc-400 mb-3 h-5">
        {bracketType === "F" 
          ? (roundData.round === 1 ? "Grand Final" : "(if necessary)")
          : bracketType === "L" 
            ? `LB Round ${roundData.round}`
            : `Round ${roundData.round}`
        }
      </div>

      {/* Matches */}
      <div className="flex flex-col" style={{ gap: verticalSpacing - MATCH_HEIGHT }}>
        {roundData.matches.map((match) => {
          const matchNum = matchIndexMap.get(match.id) ?? 0;

          return (
            <MatchCard
              key={match.id}
              match={match}
              matchIndex={matchNum}
              onClick={() => onMatchClick(match)}
              isEditable={isEditable}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN BRACKET VIEWER COMPONENT
// ============================================================================

export default function BracketViewer({
  bracketId,
  matches: initialMatches,
  isEditable = true,
}: BracketViewerProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [updating, setUpdating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch bracket data
  const fetchBracket = useCallback(async () => {
    try {
      const res = await fetch(`/api/brackets/${bracketId}`);
      const data = await res.json();
      if (!res.ok || !data?.matches) {
        toast.error(data?.error || "Failed to load bracket");
        return;
      }
      setMatches(data.matches || []);
    } catch {
      toast.error("Failed to load bracket");
    }
  }, [bracketId]);

  useEffect(() => {
    if (!initialMatches) fetchBracket();
  }, [initialMatches, fetchBracket]);

  // Handle score submission
  const handleUpdateScore = async (scoreA: number, scoreB: number) => {
    if (!selectedMatch) return;
    
    try {
      setUpdating(true);
      const res = await fetch(`/api/brackets/${bracketId}/resolve-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          matchId: selectedMatch.id, 
          scoreA, 
          scoreB 
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update score");
      
      toast.success("Result updated!");
      setSelectedMatch(null);
      fetchBracket();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating score");
    } finally {
      setUpdating(false);
    }
  };

  // Group matches by bracket type and round
  const groupByRound = useCallback((matches: Match[], type: "W" | "L" | "F"): RoundData[] => {
    const filtered = matches.filter((m) => m.bracket === type);
    const byRound: Record<number, Match[]> = {};
    
    filtered.forEach((m) => {
      byRound[m.round] = byRound[m.round] || [];
      byRound[m.round].push(m);
    });
    
    return Object.entries(byRound)
      .map(([r, ms]) => ({ 
        round: Number(r), 
        matches: ms.sort((a, b) => a.matchNumber - b.matchNumber) 
      }))
      .sort((a, b) => a.round - b.round);
  }, []);

  const winners = useMemo(() => groupByRound(matches, "W"), [matches, groupByRound]);
  const losers = useMemo(() => groupByRound(matches, "L"), [matches, groupByRound]);
  const finals = useMemo(() => groupByRound(matches, "F"), [matches, groupByRound]);

  // Pre-compute match index map (deterministic, no mutable state)
  const matchIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    let idx = 1;
    
    // Winners bracket matches first
    winners.forEach((round) => {
      round.matches.forEach((match) => {
        map.set(match.id, idx++);
      });
    });
    
    // Finals
    finals.forEach((round) => {
      round.matches.forEach((match) => {
        map.set(match.id, idx++);
      });
    });
    
    // Losers bracket
    losers.forEach((round) => {
      round.matches.forEach((match) => {
        map.set(match.id, idx++);
      });
    });
    
    return map;
  }, [winners, losers, finals]);

  // Calculate total dimensions
  const hasDoubleElim = losers.length > 0;

  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Score Modal */}
      {selectedMatch && (
        <ScoreModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSubmit={handleUpdateScore}
          updating={updating}
        />
      )}

      {/* Bracket Container */}
      <div 
        ref={containerRef}
        className="overflow-auto p-6 relative"
      >

        {/* Winners Bracket */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-wider">
            Winners Bracket
          </h3>
          <div className="flex items-start">
            {winners.map((roundData, roundIdx) => (
              <BracketRound
                key={`W-${roundData.round}`}
                roundData={roundData}
                roundIndex={roundIdx}
                totalRounds={winners.length}
                bracketType="W"
                matchIndexMap={matchIndexMap}
                onMatchClick={setSelectedMatch}
                isEditable={isEditable}
              />
            ))}

            {/* Grand Finals */}
            {finals.length > 0 && (
              <div className="flex flex-col" style={{ marginLeft: ROUND_GAP }}>
                <div className="text-xs font-medium text-indigo-400 mb-3 h-5">
                  Grand Finals
                </div>
                <div className="flex flex-col gap-4">
                  {finals.map((roundData) => (
                    roundData.matches.map((match) => {
                      const matchNum = matchIndexMap.get(match.id) ?? 0;
                      return (
                        <div key={match.id}>
                          <MatchCard
                            match={match}
                            matchIndex={matchNum}
                            onClick={() => setSelectedMatch(match)}
                            isEditable={isEditable}
                          />
                          {match.id === "GF2" && (
                            <div className="text-xs text-zinc-500 mt-1 ml-9 italic">
                              (if necessary)
                            </div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Losers Bracket */}
        {hasDoubleElim && (
          <div className="mt-12 pt-8 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-orange-400 mb-4 uppercase tracking-wider">
              Losers Bracket
            </h3>
            <div className="flex items-start">
              {losers.map((roundData, roundIdx) => (
                <BracketRound
                  key={`L-${roundData.round}`}
                  roundData={roundData}
                  roundIndex={roundIdx}
                  totalRounds={losers.length}
                  bracketType="L"
                  matchIndexMap={matchIndexMap}
                  onMatchClick={setSelectedMatch}
                  isEditable={isEditable}
                />
              ))}
            </div>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-zinc-800 rounded-lg p-2 shadow-lg">
          <span className="text-xs text-zinc-400 px-2">100%</span>
          <button className="text-zinc-400 hover:text-white p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
