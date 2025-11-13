// lib/services/resultsService.ts
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import Tournament from "@/lib/models/Tournament";
import mongoose from "mongoose";

export interface Standing {
  participant: string;
  wins: number;
  losses: number;
  matchesPlayed: number;
  placement: number;
  winRate: number;
}

export interface MatchHistoryItem {
  id: string;
  round: number;
  bracket: string;
  opponentA: string;
  opponentB: string;
  scoreA: number;
  scoreB: number;
  winner: "A" | "B";
  scheduledAt?: Date;
}

export interface ParticipantStats {
  participant: string;
  wins: number;
  losses: number;
  matchesPlayed: number;
  winRate: number;
  matchHistory: MatchHistoryItem[];
}

/**
 * Calculate standings from bracket matches
 */
export async function calculateStandings(tournamentId: string): Promise<Standing[]> {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || !tournament.bracketId) {
    throw new Error("Tournament or bracket not found");
  }

  const bracket = await Bracket.findOne({ bracketId: tournament.bracketId });
  if (!bracket) {
    throw new Error("Bracket not found");
  }

  const stats: Record<string, { wins: number; losses: number; matchesPlayed: number }> = {};

  // Calculate stats from finished matches (exclude BYE auto-advances)
  bracket.matches
    .filter((m: any) => {
      // Must be finished with both opponents present
      if (!m.finished || !m.opponentA?.label || !m.opponentB?.label) return false;
      
      // Exclude BYE matches - check if either opponent is "BYE"
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    })
    .forEach((match: any) => {
      const teamA = match.opponentA.label;
      const teamB = match.opponentB.label;

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

  // Convert to array and sort
  const standings = Object.entries(stats)
    .map(([participant, data]) => ({
      participant,
      ...data,
      winRate: data.matchesPlayed > 0 ? (data.wins / data.matchesPlayed) * 100 : 0,
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    })
    .map((standing, index) => ({
      ...standing,
      placement: index + 1,
    }));

  return standings;
}

/**
 * Get match history for a tournament
 */
export async function getMatchHistory(tournamentId: string): Promise<MatchHistoryItem[]> {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || !tournament.bracketId) {
    throw new Error("Tournament or bracket not found");
  }

  const bracket = await Bracket.findOne({ bracketId: tournament.bracketId });
  if (!bracket) {
    throw new Error("Bracket not found");
  }

  const history = bracket.matches
    .filter((m: any) => {
      // Must be finished with both opponents
      if (!m.finished || !m.opponentA?.label || !m.opponentB?.label) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    })
    .map((match: any) => ({
      id: match.id,
      round: match.round,
      bracket: match.bracket,
      opponentA: match.opponentA.label,
      opponentB: match.opponentB.label,
      scoreA: match.scoreA || 0,
      scoreB: match.scoreB || 0,
      winner: match.winner,
      scheduledAt: match.scheduledAt,
    }))
    .sort((a: any, b: any) => b.round - a.round);

  return history;
}

/**
 * Get stats for a specific participant
 */
export async function getParticipantStats(
  tournamentId: string,
  participantName: string
): Promise<ParticipantStats | null> {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || !tournament.bracketId) {
    throw new Error("Tournament or bracket not found");
  }

  const bracket = await Bracket.findOne({ bracketId: tournament.bracketId });
  if (!bracket) {
    throw new Error("Bracket not found");
  }

  let wins = 0;
  let losses = 0;
  let matchesPlayed = 0;
  const matchHistory: MatchHistoryItem[] = [];

  bracket.matches
    .filter((m: any) => {
      // Must be finished and involve the participant
      if (!m.finished) return false;
      if (m.opponentA?.label !== participantName && m.opponentB?.label !== participantName) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    })
    .forEach((match: any) => {
      matchesPlayed++;

      const isTeamA = match.opponentA.label === participantName;
      const won = (isTeamA && match.winner === "A") || (!isTeamA && match.winner === "B");

      if (won) wins++;
      else losses++;

      matchHistory.push({
        id: match.id,
        round: match.round,
        bracket: match.bracket,
        opponentA: match.opponentA.label,
        opponentB: match.opponentB.label,
        scoreA: match.scoreA || 0,
        scoreB: match.scoreB || 0,
        winner: match.winner,
        scheduledAt: match.scheduledAt,
      });
    });

  if (matchesPlayed === 0) {
    return null;
  }

  return {
    participant: participantName,
    wins,
    losses,
    matchesPlayed,
    winRate: (wins / matchesPlayed) * 100,
    matchHistory: matchHistory.sort((a, b) => b.round - a.round),
  };
}

/**
 * Generate final standings and check if tournament is complete
 */
export async function generateFinalStandings(tournamentId: string) {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || !tournament.bracketId) {
    throw new Error("Tournament or bracket not found");
  }

  const bracket = await Bracket.findOne({ bracketId: tournament.bracketId });
  if (!bracket) {
    throw new Error("Bracket not found");
  }

  // Check if all matches are complete (excluding BYE matches)
  const totalMatches = bracket.matches.filter((m: any) => {
    // Count matches with both opponents (real matches)
    if (!m.opponentA?.label || !m.opponentB?.label) return false;
    
    // Exclude BYE auto-advances
    const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
    return !isByeMatch;
  }).length;
  
  const finishedMatches = bracket.matches.filter((m: any) => {
    if (!m.finished) return false;
    
    // Exclude BYE matches from finished count
    const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
    return !isByeMatch;
  }).length;
  
  const isComplete = totalMatches > 0 && finishedMatches === totalMatches;

  // Calculate standings
  const standings = await calculateStandings(tournamentId);

  // Find champion only if tournament is complete
  let champion = null;
  if (isComplete) {
    // Find the final match (highest round in main bracket)
    const mainBracketMatches = bracket.matches.filter((m: any) => m.bracket === "main");
    if (mainBracketMatches.length > 0) {
      const finalMatch = mainBracketMatches.reduce((highest: any, current: any) => {
        return current.round > highest.round ? current : highest;
      }, mainBracketMatches[0]);

      if (finalMatch && finalMatch.finished) {
        champion = finalMatch.winner === "A"
          ? finalMatch.opponentA.label
          : finalMatch.opponentB.label;
      }
    }
  }

  // Auto-update tournament status if complete
  if (isComplete && tournament.status !== "completed") {
    tournament.status = "completed";
    tournament.resultsPublished = true;
    await tournament.save();
  }

  return {
    standings,
    champion,
    isComplete,
    completionPercentage: totalMatches > 0 ? Math.round((finishedMatches / totalMatches) * 100) : 0,
    totalMatches,
    finishedMatches,
  };
}

/**
 * Publish or unpublish results
 */
export async function toggleResultsPublish(tournamentId: string, publish: boolean) {
  await connectDB();

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found");
  }

  tournament.resultsPublished = publish;
  await tournament.save();

  return tournament;
}
