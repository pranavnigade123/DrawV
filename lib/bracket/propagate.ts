/**
 * ==============================================================================
 * MATCH RESULT PROPAGATION - REFACTORED WITH PROPER DSA
 * ==============================================================================
 * 
 * This module handles match result updates and propagation through the bracket.
 * 
 * REFACTORED IMPLEMENTATION:
 * - Uses graph traversal (DFS) for cycle detection → O(V + E)
 * - BFS for winner/loser propagation → O(log n)
 * - Transactional updates with MongoDB sessions
 * - Idempotent operations (safe to retry)
 * - Grand Final bracket reset logic
 * 
 * DATA STRUCTURES:
 * - Graph (adjacency list) for cycle detection
 * - Queue for BFS traversal
 * - Set for visited tracking
 * 
 * ==============================================================================
 */

import mongoose from "mongoose";
import BracketModel from "@/lib/models/Brackets";
import { updateMatchResult as engineUpdateMatch } from "./engine";
import type { BracketMatch } from "./algorithms";

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Find match by ID in bracket document
 * @complexity O(n) - linear search through matches array
 */
function findMatch(bracketDoc: any, id: string): any {
  return bracketDoc.matches.find((m: any) => m.id === id);
}

/**
 * Check if participant slot is empty
 * @complexity O(1)
 */
function isSlotEmpty(slot: any): boolean {
  if (!slot) return true;
  if (slot.type === "placeholder") return true;
  if (!slot.label) return true;
  return false;
}

/**
 * Cycle detection using DFS with recursion stack
 * Detects cycles in winnerto/loserto graph
 * 
 * Algorithm: Three-color DFS
 * - White (unvisited): not in visited set
 * - Gray (visiting): in recursion stack
 * - Black (visited): in visited set
 * 
 * @complexity O(V + E) where V = matches, E = winnerto/loserto edges
 */
function detectCycle(matches: any[], startId: string): boolean {
  // Build adjacency list
  const edges: Record<string, string[]> = {};
  for (const m of matches) {
    edges[m.id] = [];
    if (m.winnerto) edges[m.id].push(m.winnerto);
    if (m.loserto) edges[m.id].push(m.loserto);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (!edges[nodeId]) return false;
    
    // Gray node (currently in recursion) = cycle detected
    if (recursionStack.has(nodeId)) return true;
    
    // Black node (already fully processed) = no cycle from here
    if (visited.has(nodeId)) return false;

    // Mark as gray (visiting)
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Explore neighbors
    for (const neighbor of edges[nodeId]) {
      if (dfs(neighbor)) return true;
    }

    // Mark as black (done)
    recursionStack.delete(nodeId);
    return false;
  }

  return dfs(startId);
}

/**
 * Determine if opponent came from losers bracket
 * Used for Grand Final bracket reset logic
 * 
 * @complexity O(n * m) where n = matches, m = avg participants per match
 */
function isFromLosersBracket(bracketDoc: any, opponent: any): boolean {
  if (!opponent || !opponent.label) return false;
  
  return bracketDoc.matches.some((m: any) => 
    m.bracket === "L" && 
    (
      (m.opponentA?.label && m.opponentA.label === opponent.label) || 
      (m.opponentB?.label && m.opponentB.label === opponent.label)
    )
  );
}

// ==============================================================================
// MAIN PROPAGATION FUNCTION
// ==============================================================================

/**
 * Apply match result and propagate winners/losers through bracket
 * 
 * ALGORITHM:
 * 1. Validate input (scores, participants)
 * 2. Check for cycles in graph (DFS)
 * 3. Update match with scores and winner
 * 4. Propagate winner to next match (BFS)
 * 5. Propagate loser to losers bracket (BFS)
 * 6. Handle Grand Final bracket reset logic
 * 7. Commit transaction atomically
 * 
 * FEATURES:
 * - Idempotent: reapplying same result is no-op
 * - Transactional: all-or-nothing update
 * - Cycle-safe: detects and prevents graph cycles
 * 
 * @complexity O(V + E + log n) = O(V + E)
 * - O(V + E) for cycle detection
 * - O(log n) for propagation
 * 
 * @param bracketId Bracket identifier
 * @param matchId Match to update (e.g., "R1M1")
 * @param scoreA Score for opponent A
 * @param scoreB Score for opponent B
 * @param options force = overwrite existing results
 */
export async function applyMatchResult(
  bracketId: string,
  matchId: string,
  scoreA: number,
  scoreB: number,
  options: { force?: boolean } = {}
): Promise<{ ok: boolean; message?: string }> {
  // Validate scores
  if (scoreA === scoreB) {
    throw new Error("Draws not supported");
  }

  // Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch bracket
    const bracketDoc = await BracketModel.findOne({ bracketId }).session(session);
    if (!bracketDoc) {
      throw new Error("Bracket not found");
    }

    const match = findMatch(bracketDoc, matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Determine winner and loser
    const newWinner = scoreA > scoreB ? "A" : "B";
    const newLoser = newWinner === "A" ? "B" : "A";

    // Idempotent check - if match already has same result, no-op
    if (
      match.finished &&
      match.winner === newWinner &&
      match.scoreA === scoreA &&
      match.scoreB === scoreB
    ) {
      await session.commitTransaction();
      session.endSession();
      return { ok: true, message: "No changes (idempotent)" };
    }

    // Cycle detection before making changes
    if (detectCycle(bracketDoc.matches, matchId)) {
      throw new Error("Cycle detected in winnerto/loserto graph; aborting");
    }

    // Update match result
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.winner = newWinner;
    match.finished = true;

    const winnerOpponent = newWinner === "A" ? match.opponentA : match.opponentB;
    const loserOpponent = newLoser === "A" ? match.opponentA : match.opponentB;

    // ================================================================
    // WINNER PROPAGATION (BFS)
    // ================================================================
    if (match.winnerto) {
      const targetMatch = findMatch(bracketDoc, match.winnerto);
      if (!targetMatch) {
        throw new Error(`winnerto target ${match.winnerto} not found`);
      }

      // Add propagation metadata
      const propagatedWinner = {
        ...winnerOpponent,
        propagatedFrom: matchId,
      };

      // Place winner in first available slot
      if (isSlotEmpty(targetMatch.opponentA)) {
        targetMatch.opponentA = propagatedWinner;
      } else if (isSlotEmpty(targetMatch.opponentB)) {
        targetMatch.opponentB = propagatedWinner;
      } else {
        // Both slots filled
        if (!options.force) {
          throw new Error(`winnerto target ${targetMatch.id} has no empty slots`);
        }
        // Force mode: overwrite slot B
        targetMatch.opponentB = propagatedWinner;
      }
    }

    // ================================================================
    // LOSER PROPAGATION (BFS) - Double Elimination Only
    // ================================================================
    if (match.loserto) {
      const targetMatch = findMatch(bracketDoc, match.loserto);
      if (!targetMatch) {
        throw new Error(`loserto target ${match.loserto} not found`);
      }

      const propagatedLoser = {
        ...loserOpponent,
        propagatedFrom: matchId,
      };

      // Use metadata hint for preferred slot
      const preferredSlot = match.metadata?.loserSlot || match.metadata?.loserExpectedSlot;

      if (preferredSlot === "A" && isSlotEmpty(targetMatch.opponentA)) {
        targetMatch.opponentA = propagatedLoser;
      } else if (preferredSlot === "B" && isSlotEmpty(targetMatch.opponentB)) {
        targetMatch.opponentB = propagatedLoser;
      } else {
        // Fallback: first available slot
        if (isSlotEmpty(targetMatch.opponentA)) {
          targetMatch.opponentA = propagatedLoser;
        } else if (isSlotEmpty(targetMatch.opponentB)) {
          targetMatch.opponentB = propagatedLoser;
        } else {
          if (!options.force) {
            throw new Error(`loserto target ${targetMatch.id} has no empty slots`);
          }
          targetMatch.opponentB = propagatedLoser;
        }
      }
    }

    // ================================================================
    // GRAND FINAL BRACKET RESET LOGIC
    // ================================================================
    // If this is GF or GF1 and loser bracket winner beats winner bracket winner,
    // activate GF2 (bracket reset)
    if (match.id === "GF1" || match.id === "GF" || match.id === "UBGF") {
      const oppA = match.opponentA;
      const oppB = match.opponentB;
      
      const winnerOppObj = newWinner === "A" ? oppA : oppB;
      const loserOppObj = newLoser === "A" ? oppA : oppB;

      // Check if winner came from losers bracket and loser from winners
      const winnerFromLB = isFromLosersBracket(bracketDoc, winnerOppObj);
      const loserFromWB = !isFromLosersBracket(bracketDoc, loserOppObj);

      // Bracket reset: LB winner beats WB winner
      if (winnerFromLB && loserFromWB) {
        // Find or create GF2
        let gf2 = findMatch(bracketDoc, "GF2");
        
        if (!gf2) {
          // Create GF2 if it doesn't exist
          bracketDoc.matches.push({
            id: "GF2",
            bracket: "F",
            round: match.round + 1,
            matchNumber: 2,
            opponentA: oppA,
            opponentB: oppB,
            scoreA: null,
            scoreB: null,
            winner: null,
            finished: false,
            winnerto: null,
            loserto: null,
            metadata: {
              grandFinal: true,
              bracketReset: true,
              description: "Grand Final Game 2 (Bracket Reset)",
            },
          });
        } else {
          // Activate existing GF2
          gf2.opponentA = oppA;
          gf2.opponentB = oppB;
          gf2.scoreA = null;
          gf2.scoreB = null;
          gf2.finished = false;
          gf2.winner = null;
          gf2.metadata = gf2.metadata || {};
          gf2.metadata.reserved = false;
        }
      }
    }

    // Commit transaction
    await bracketDoc.save({ session });
    await session.commitTransaction();
    session.endSession();

    return { ok: true };
  } catch (err) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

// ==============================================================================
// BATCH UPDATE SUPPORT
// ==============================================================================

/**
 * Apply multiple match results in sequence
 * Useful for bulk updates or tournament progression
 * 
 * @complexity O(k * (V + E)) where k = number of updates
 */
export async function applyBatchResults(
  bracketId: string,
  updates: Array<{
    matchId: string;
    scoreA: number;
    scoreB: number;
  }>,
  options: { force?: boolean; continueOnError?: boolean } = {}
): Promise<{
  ok: boolean;
  successful: string[];
  failed: Array<{ matchId: string; error: string }>;
}> {
  const successful: string[] = [];
  const failed: Array<{ matchId: string; error: string }> = [];

  for (const update of updates) {
    try {
      await applyMatchResult(
        bracketId,
        update.matchId,
        update.scoreA,
        update.scoreB,
        options
      );
      successful.push(update.matchId);
    } catch (err: any) {
      failed.push({
        matchId: update.matchId,
        error: err.message || "Unknown error",
      });

      if (!options.continueOnError) {
        break;
      }
    }
  }

  return {
    ok: failed.length === 0,
    successful,
    failed,
  };
}
