// lib/bracket/propagate.ts
import mongoose from "mongoose";
import BracketModel from "@/lib/models/Brackets";

/**
 * applyMatchResult:
 * - bracketId: bracketId string
 * - matchId: e.g., R1M1
 * - scoreA, scoreB: numbers
 * - options: { force: boolean }
 *
 * Transactional: updates match, propagates winner & loser to targets,
 * idempotent: reapplying same result no-op.
 *
 * Grand final: if GF1 result is LB winner beating WB (i.e., LB entrant wins GF1),
 * enable GF2 and populate both participants into GF2 (reserved -> active).
 */

function findMatch(bracketDoc: any, id: string) {
  return bracketDoc.matches.find((m: any) => m.id === id);
}

/** Simple cycle detection in winnerto/loserto graph */
function detectCycle(matches: any[], startId: string) {
  const edges: Record<string, string[]> = {};
  matches.forEach((m) => {
    edges[m.id] = [];
    if (m.winnerto) edges[m.id].push(m.winnerto);
    if (m.loserto) edges[m.id].push(m.loserto);
  });
  const visited = new Set<string>();
  const stack = new Set<string>();
  function dfs(n: string): boolean {
    if (!edges[n]) return false;
    if (stack.has(n)) return true;
    if (visited.has(n)) return false;
    visited.add(n);
    stack.add(n);
    for (const nx of edges[n]) {
      if (dfs(nx)) return true;
    }
    stack.delete(n);
    return false;
  }
  return dfs(startId);
}

/** helper to check if a slot is empty (placeholder or null label) */
function isSlotEmpty(slot: any) {
  if (!slot) return true;
  if (slot.type === "placeholder") return true;
  if (!slot.label) return true;
  return false;
}

export async function applyMatchResult(
  bracketId: string,
  matchId: string,
  scoreA: number,
  scoreB: number,
  options: { force?: boolean } = {}
) {
  if (scoreA === scoreB) throw new Error("Draws not supported");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bracketDoc = await BracketModel.findOne({ bracketId }).session(session);
    if (!bracketDoc) throw new Error("Bracket not found");

    const match = findMatch(bracketDoc, matchId);
    if (!match) throw new Error("Match not found");

    const newWinner = scoreA > scoreB ? "A" : "B";
    const newLoser = newWinner === "A" ? "B" : "A";

    // idempotent no-op
    if (match.finished && match.winner === newWinner && match.scoreA === scoreA && match.scoreB === scoreB) {
      await session.commitTransaction();
      session.endSession();
      return { ok: true, message: "No changes (idempotent)" };
    }

    // pre-check cycle
    if (detectCycle(bracketDoc.matches, matchId)) {
      throw new Error("Cycle detected in winnerto/loserto graph; aborting");
    }

    // update match
    match.scoreA = scoreA;
    match.scoreB = scoreB;
    match.winner = newWinner;
    match.finished = true;

    const winnerOpp = newWinner === "A" ? match.opponentA : match.opponentB;
    const loserOpp = newLoser === "A" ? match.opponentA : match.opponentB;

    // propagate winner
    if (match.winnerto) {
      const target = findMatch(bracketDoc, match.winnerto);
      if (!target) throw new Error(`winnerto target ${match.winnerto} not found`);
      // place into first empty slot
      if (isSlotEmpty(target.opponentA)) target.opponentA = winnerOpp;
      else if (isSlotEmpty(target.opponentB)) target.opponentB = winnerOpp;
      else {
        if (!options.force) throw new Error(`winnerto target ${target.id} has no empty slots`);
        // force override into B
        target.opponentB = winnerOpp;
      }
    }

    // propagate loser
    if (match.loserto) {
      const target = findMatch(bracketDoc, match.loserto);
      if (!target) throw new Error(`loserto target ${match.loserto} not found`);
      if (isSlotEmpty(target.opponentA)) target.opponentA = loserOpp;
      else if (isSlotEmpty(target.opponentB)) target.opponentB = loserOpp;
      else {
        if (!options.force) throw new Error(`loserto target ${target.id} has no empty slots`);
        target.opponentB = loserOpp;
      }
    }

    // GRAND FINAL logic: if GF1 played and LB entrant won GF1, enable GF2
    if (match.id === "GF1") {
      // helper: check whether an opponent came from loser bracket earlier
      function fromLoser(op: any) {
        return bracketDoc.matches.some((m: any) => m.bracket === "L" && ((m.opponentA?.label && m.opponentA.label === op.label) || (m.opponentB?.label && m.opponentB.label === op.label)));
      }
      const a = match.opponentA;
      const b = match.opponentB;
      const winnerOppObj = newWinner === "A" ? a : b;
      const loserOppObj = newWinner === "A" ? b : a;
      const winnerFromLB = fromLoser(winnerOppObj);
      const loserFromLB = fromLoser(loserOppObj);

      // if LB winner beat WB (i.e., winnerFromLB === true and loserFromLB === false)
      if (winnerFromLB && !loserFromLB) {
        // activate GF2 and move both contestants to GF2
        let gf2 = findMatch(bracketDoc, "GF2");
        if (!gf2) {
          bracketDoc.matches.push({
            id: "GF2",
            bracket: "F",
            round: 2,
            matchNumber: 1,
            opponentA: a,
            opponentB: b,
            scoreA: null,
            scoreB: null,
            winner: null,
            finished: false,
            winnerto: null,
            loserto: null,
          });
        } else {
          gf2.opponentA = a;
          gf2.opponentB = b;
          gf2.metadata = gf2.metadata || {};
          gf2.metadata.reserved = false;
          gf2.scoreA = null;
          gf2.scoreB = null;
          gf2.finished = false;
          gf2.winner = null;
        }
      }
    }

    await bracketDoc.save({ session });
    await session.commitTransaction();
    session.endSession();
    return { ok: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
