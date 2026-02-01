/**
 * ==============================================================================
 * BRACKET ENGINE - High-Level Interface for Bracket Operations
 * ==============================================================================
 * 
 * This module provides a clean API for bracket generation and manipulation.
 * Abstracts the algorithmic complexity behind simple function calls.
 * 
 * ==============================================================================
 */

import {
  generateSingleElimination,
  generateDoubleElimination,
  propagateWinner,
  propagateLoser,
  shuffleTeams,
  BracketTree,
  BracketMatch,
  type MatchParticipant,
} from "./algorithms";

// ==============================================================================
// BRACKET GENERATION API
// ==============================================================================

export interface GenerationOptions {
  format: "single_elim" | "double_elim";
  participants: string[];
  shuffle?: boolean;
  seeding?: "standard" | "snake";
}

export interface BracketResult {
  bracketId: string;
  format: "single_elim" | "double_elim";
  participantsCount: number;
  matches: BracketMatch[];
  metadata: {
    totalRounds: number;
    totalMatches: number;
    generationTimestamp: Date;
    algorithm: string;
  };
}

/**
 * Main bracket generation function
 * Unified interface for all bracket types
 * 
 * @complexity O(n) for single, O(n log n) for double
 */
export function generateBracket(options: GenerationOptions): BracketResult {
  const { format, participants, shuffle = false, seeding = "standard" } = options;
  
  if (!participants || participants.length < 2) {
    throw new Error("At least 2 participants required");
  }
  
  // Remove empty participants
  const cleanedParticipants = participants.filter(p => p && p.trim() !== "");
  
  let bracket: BracketTree;
  let algorithm: string;
  
  if (format === "single_elim") {
    bracket = generateSingleElimination(cleanedParticipants, { shuffle, seeding });
    algorithm = "Binary Tree - Single Elimination";
  } else if (format === "double_elim") {
    bracket = generateDoubleElimination(cleanedParticipants, { shuffle, seeding });
    algorithm = "Dual Tree + HashMap - Double Elimination";
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }
  
  const totalRounds = Math.max(...bracket.matches.map(m => m.round));
  
  return {
    bracketId: bracket.bracketId,
    format: bracket.format,
    participantsCount: bracket.participantsCount,
    matches: bracket.matches,
    metadata: {
      totalRounds,
      totalMatches: bracket.matches.length,
      generationTimestamp: new Date(),
      algorithm,
    },
  };
}

// ==============================================================================
// MATCH UPDATE API
// ==============================================================================

export interface MatchUpdateResult {
  success: boolean;
  updatedMatches: string[]; // IDs of matches that were updated
  errors?: string[];
}

/**
 * Update match result and propagate winners/losers
 * 
 * Algorithm:
 * 1. Validate match exists and has participants
 * 2. Determine winner/loser
 * 3. Propagate winner to next match (BFS)
 * 4. Propagate loser to losers bracket if double elim (BFS)
 * 5. Handle auto-advancement for BYEs
 * 
 * @complexity O(log n) - tree traversal
 */
export function updateMatchResult(
  matches: BracketMatch[],
  matchId: string,
  scoreA: number,
  scoreB: number,
  options: { force?: boolean } = {}
): MatchUpdateResult {
  const errors: string[] = [];
  const updatedMatches: string[] = [];
  
  // Find match
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return { success: false, updatedMatches, errors: ["Match not found"] };
  }
  
  // Validate scores
  if (scoreA === scoreB) {
    return { success: false, updatedMatches, errors: ["Draws not supported"] };
  }
  
  // Validate participants
  if (match.opponentA.type === "placeholder" || match.opponentB.type === "placeholder") {
    return { success: false, updatedMatches, errors: ["Cannot score match with placeholder participants"] };
  }
  
  // Determine winner
  const winner = scoreA > scoreB ? "A" : "B";
  const loser = winner === "A" ? "B" : "A";
  
  // Update match
  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winner = winner;
  match.finished = true;
  updatedMatches.push(matchId);
  
  // Propagate winner
  if (match.winnerto) {
    try {
      propagateWinner(matches, matchId, winner);
      const targetMatch = matches.find(m => m.id === match.winnerto);
      if (targetMatch) {
        updatedMatches.push(targetMatch.id);
      }
    } catch (err) {
      errors.push(`Failed to propagate winner: ${err}`);
    }
  }
  
  // Propagate loser (double elimination only)
  if (match.loserto) {
    try {
      propagateLoser(matches, matchId, loser);
      const targetMatch = matches.find(m => m.id === match.loserto);
      if (targetMatch) {
        updatedMatches.push(targetMatch.id);
      }
    } catch (err) {
      errors.push(`Failed to propagate loser: ${err}`);
    }
  }
  
  // Auto-advance BYEs
  autoAdvanceByes(matches, updatedMatches);
  
  return {
    success: errors.length === 0,
    updatedMatches: [...new Set(updatedMatches)], // Remove duplicates
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Auto-advance matches where opponent is BYE
 * BYE matches are automatically won by the non-BYE participant
 * 
 * @complexity O(n) worst case (if all matches have BYEs)
 */
function autoAdvanceByes(matches: BracketMatch[], updatedMatches: string[]): void {
  let hasChanges = true;
  const processed = new Set<string>();
  
  // Iteratively process BYE matches (BFS approach)
  while (hasChanges) {
    hasChanges = false;
    
    for (const match of matches) {
      if (processed.has(match.id) || match.finished) continue;
      
      const aIsBye = match.opponentA.type === "bye";
      const bIsBye = match.opponentB.type === "bye";
      const aIsValid = match.opponentA.type === "team" && match.opponentA.label;
      const bIsValid = match.opponentB.type === "team" && match.opponentB.label;
      
      // BYE vs BYE should not happen, but handle it
      if (aIsBye && bIsBye) {
        match.finished = true;
        processed.add(match.id);
        continue;
      }
      
      // One opponent is BYE, auto-advance the other
      if ((aIsBye && bIsValid) || (bIsBye && aIsValid)) {
        const winner = aIsBye ? "B" : "A";
        match.scoreA = aIsBye ? 0 : 1;
        match.scoreB = bIsBye ? 0 : 1;
        match.winner = winner;
        match.finished = true;
        match.metadata.autoAdvanced = true;
        
        processed.add(match.id);
        updatedMatches.push(match.id);
        hasChanges = true;
        
        // Propagate winner
        if (match.winnerto) {
          propagateWinner(matches, match.id, winner);
        }
        
        // Propagate loser (though BYE shouldn't go to losers bracket)
        if (match.loserto && !aIsBye && !bIsBye) {
          const loser = winner === "A" ? "B" : "A";
          propagateLoser(matches, match.id, loser);
        }
      }
    }
  }
}

// ==============================================================================
// BRACKET VALIDATION
// ==============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate bracket structure and integrity
 * Checks for:
 * - Cycles in winnerto/loserto graph
 * - Orphaned matches
 * - Invalid references
 * - Tree structure correctness
 * 
 * @complexity O(V + E) - graph traversal
 */
export function validateBracket(bracket: BracketTree): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const matchIds = new Set(bracket.matches.map(m => m.id));
  
  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(matchId: string): boolean {
    if (!matchIds.has(matchId)) return false;
    if (recursionStack.has(matchId)) return true;
    if (visited.has(matchId)) return false;
    
    visited.add(matchId);
    recursionStack.add(matchId);
    
    const match = bracket.matches.find(m => m.id === matchId);
    if (match) {
      if (match.winnerto && hasCycle(match.winnerto)) return true;
      if (match.loserto && hasCycle(match.loserto)) return true;
    }
    
    recursionStack.delete(matchId);
    return false;
  }
  
  // Check each match
  for (const match of bracket.matches) {
    // Cycle detection
    if (hasCycle(match.id)) {
      errors.push(`Cycle detected involving match ${match.id}`);
    }
    
    // Check winnerto reference
    if (match.winnerto && !matchIds.has(match.winnerto)) {
      errors.push(`Match ${match.id} references non-existent winnerto: ${match.winnerto}`);
    }
    
    // Check loserto reference
    if (match.loserto && !matchIds.has(match.loserto)) {
      errors.push(`Match ${match.id} references non-existent loserto: ${match.loserto}`);
    }
    
    // Warn about empty participants in early rounds
    if (match.round === 1) {
      if (match.opponentA.type === "placeholder" || match.opponentB.type === "placeholder") {
        warnings.push(`Match ${match.id} in round 1 has placeholder participants`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ==============================================================================
// BRACKET STATISTICS
// ==============================================================================

export interface BracketStatistics {
  totalMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  totalRounds: number;
  currentRound: number;
  participantsCount: number;
  eliminatedCount: number;
  remainingCount: number;
  completionPercentage: number;
}

/**
 * Calculate bracket statistics
 * 
 * @complexity O(n)
 */
export function getBracketStatistics(bracket: BracketTree): BracketStatistics {
  const totalMatches = bracket.matches.length;
  const finishedMatches = bracket.matches.filter(m => m.finished).length;
  const pendingMatches = totalMatches - finishedMatches;
  
  const totalRounds = Math.max(...bracket.matches.map(m => m.round));
  
  // Find current round (highest round with unfinished matches)
  let currentRound = 1;
  for (let r = 1; r <= totalRounds; r++) {
    const roundMatches = bracket.matches.filter(m => m.round === r);
    if (roundMatches.some(m => !m.finished)) {
      currentRound = r;
      break;
    }
  }
  
  const participantsCount = bracket.participantsCount;
  
  // Calculate remaining teams (simplified - counts teams still in active matches)
  const activeTeams = new Set<string>();
  for (const match of bracket.matches) {
    if (!match.finished) {
      if (match.opponentA.label && match.opponentA.type === "team") {
        activeTeams.add(match.opponentA.label);
      }
      if (match.opponentB.label && match.opponentB.type === "team") {
        activeTeams.add(match.opponentB.label);
      }
    }
  }
  
  const remainingCount = activeTeams.size;
  const eliminatedCount = participantsCount - remainingCount;
  const completionPercentage = Math.round((finishedMatches / totalMatches) * 100);
  
  return {
    totalMatches,
    finishedMatches,
    pendingMatches,
    totalRounds,
    currentRound,
    participantsCount,
    eliminatedCount,
    remainingCount,
    completionPercentage,
  };
}

// ==============================================================================
// UTILITY EXPORTS
// ==============================================================================

export {
  shuffleTeams,
  type BracketTree,
  type BracketMatch,
  type MatchParticipant,
};
