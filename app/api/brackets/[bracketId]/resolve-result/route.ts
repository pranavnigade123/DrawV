// app/api/brackets/[bracketId]/resolve-result/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";

/**
 * POST /api/brackets/:bracketId/resolve-result
 * body: { matchId, scoreA, scoreB, force? }
 */

function findMatch(bracketDoc: any, id: string) {
  return bracketDoc.matches.find((m: any) => m.id === id);
}

function slotName(slot: "A" | "B") {
  return slot === "A" ? "opponentA" : "opponentB";
}

async function clearDownstreamPopulations(bracketDoc: any, sourceMatchId: string) {
  // Walk all matches and clear slots that have propagatedFrom === sourceMatchId
  bracketDoc.matches.forEach((m: any) => {
    ["opponentA", "opponentB"].forEach((slotKey) => {
      const slot = m[slotKey];
      if (slot && slot.propagatedFrom === sourceMatchId) {
        // clear it (only if it was auto-propagated)
        m[slotKey] = { type: "placeholder", label: null, propagatedFrom: null };
        // Also clear any subsequent downstream placements that came from this cleared match recursively
        // We'll do recursion after we finish scanning to avoid modifying array while iterating
      }
    });
  });
  // After clearing first-level, recursively clear any slots that were propagated from matches that we just cleared.
  // Simple efficient approach: call this function repeatedly until no propagatedFrom matches remain referencing removed IDs.
  // For performance on small brackets this is fine.
}

export async function POST(req: NextRequest, { params }: { params: { bracketId: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const { matchId, scoreA, scoreB, force = false } = body;
    if (typeof matchId !== "string") return NextResponse.json({ error: "matchId required" }, { status: 400 });
    if (typeof scoreA !== "number" || typeof scoreB !== "number") return NextResponse.json({ error: "scores required" }, { status: 400 });
    if (scoreA === scoreB) return NextResponse.json({ error: "tie not supported" }, { status: 400 });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const bracketDoc = await Bracket.findOne({ bracketId: params.bracketId }).session(session);
      if (!bracketDoc) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
      }

      const match: any = findMatch(bracketDoc, matchId);
      if (!match) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      const newWinnerSide = scoreA > scoreB ? "A" : "B";
      const newLoserSide = newWinnerSide === "A" ? "B" : "A";

      // Idempotent no-op
      if (match.finished && match.winner === newWinnerSide && match.scoreA === scoreA && match.scoreB === scoreB) {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json({ ok: true, message: "No changes (idempotent)" }, { status: 200 });
      }

      // If match had previous result and changed, we must clear downstream slots that were auto-populated by previous outcome.
      const priorFinished = match.finished;
      const priorWinner = match.winner;
      if (priorFinished && priorWinner && priorWinner !== newWinnerSide) {
        // clear downstream placements that were propagated from this match
        // We need to find slots with propagatedFrom == match.id and clear them recursively.
        const toClear = new Set<string>();
        // first level: find matches and slots populated by this match
        bracketDoc.matches.forEach((mm: any) => {
          ["opponentA", "opponentB"].forEach((slotKey) => {
            const slot = mm[slotKey];
            if (slot && slot.propagatedFrom === match.id) {
              // clear it
              mm[slotKey] = { type: "placeholder", label: null, propagatedFrom: null };
              toClear.add(mm.id);
            }
          });
        });
        // Recursively clear any slots that were populated from matches in toClear
        let changed = true;
        while (changed) {
          changed = false;
          bracketDoc.matches.forEach((mm: any) => {
            ["opponentA", "opponentB"].forEach((slotKey) => {
              const slot = mm[slotKey];
              if (slot && slot.propagatedFrom && toClear.has(slot.propagatedFrom)) {
                mm[slotKey] = { type: "placeholder", label: null, propagatedFrom: null };
                if (!toClear.has(mm.id)) {
                  toClear.add(mm.id);
                  changed = true;
                }
              }
            });
          });
        }
      }

      // Update this match
      match.scoreA = scoreA;
      match.scoreB = scoreB;
      match.winner = newWinnerSide;
      match.finished = true;

      const winnerOpp = newWinnerSide === "A" ? match.opponentA : match.opponentB;
      const loserOpp = newLoserSide === "A" ? match.opponentA : match.opponentB;

      // helper to place team into target with deterministic slot rules
      function placeToTarget(targetId: string | null, team: any, fromMatchId: string, expectedSlot?: "A" | "B") {
        if (!targetId) return { ok: false, reason: "no target" };
        const targetMatch: any = findMatch(bracketDoc, targetId);
        if (!targetMatch) return { ok: false, reason: "target not found" };

        // Determine slot to place:
        let slotToUse: "A" | "B" | null = null;

        // 1) prefer expectedSlot from source metadata if present
        if (expectedSlot) slotToUse = expectedSlot;

        // 2) else, if targetMatch.metadata indicates an expected slot for this source, use that (search metadata keys)
        if (!slotToUse && targetMatch.metadata) {
          // Example metadata.expectedLoserSlot may include mapping; the skeleton generator set source metadata.loserExpectedSlot
          // But here we try to infer: if source match added metadata.loserExpectedSlot we used that when setting source.winnerto/l... 
          // Simpler: pick first empty slot or override if force
        }

        // 3) if still null, pick the first empty slot
        if (!slotToUse) {
          if (!targetMatch.opponentA?.label || targetMatch.opponentA.type === "placeholder") slotToUse = "A";
          else if (!targetMatch.opponentB?.label || targetMatch.opponentB.type === "placeholder") slotToUse = "B";
        }

        if (!slotToUse) {
          // no empty slot
          if (!force) return { ok: false, reason: "no empty slot" };
          // else choose B to override
          slotToUse = "B";
        }

        const slotKey = slotName(slotToUse);
        // If there's already someone and it's identical team, fine.
        const existing = targetMatch[slotKey];
        if (existing && existing.label && existing.label === team.label) {
          // already present
          return { ok: true, placed: false };
        }
        // If existing occupant is a different team and was manually set (propagatedFrom null), avoid overwrite unless force
        if (existing && existing.label && existing.propagatedFrom === null && !force) {
          return { ok: false, reason: "occupied by manual value" };
        }

        // place team and mark propagatedFrom
        targetMatch[slotKey] = { ...team, propagatedFrom: fromMatchId };
        return { ok: true, placed: true, slot: slotToUse };
      }

      // Place winner into its winnerto using deterministic expected slot if declared in source metadata
      let winnerExpectedSlot: "A" | "B" | undefined = undefined;
      if (match.metadata && match.metadata.winnerExpectedSlot) winnerExpectedSlot = match.metadata.winnerExpectedSlot;

      if (match.winnerto) {
        const res = placeToTarget(match.winnerto, winnerOpp, match.id, winnerExpectedSlot);
        if (!res.ok) {
          // conflict handling: if reason indicates manual occupant, return error unless force
          if (res.reason === "no empty slot" && !force) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: `winnerto target ${match.winnerto} has no empty slot` }, { status: 409 });
          }
        }
      }

      // Place loser into loserto using expected slot if provided
      let loserExpectedSlot: "A" | "B" | undefined = undefined;
      if (match.metadata && match.metadata.loserExpectedSlot) loserExpectedSlot = match.metadata.loserExpectedSlot;

      if (match.loserto) {
        const res2 = placeToTarget(match.loserto, loserOpp, match.id, loserExpectedSlot);
        if (!res2.ok) {
          if (res2.reason === "no empty slot" && !force) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: `loserto target ${match.loserto} has no empty slot` }, { status: 409 });
          }
        }
      }

      // GF1 special-case: after setting GF1 if LB winner won GF1 -> enable GF2 (reset)
      if (match.id === "GF1") {
        // Determine whether winnerOpp came from loser bracket by checking its propagatedFrom or by scanning previous placement
        function isFromLoser(op: any) {
          // Check propagatedFrom path: if propagatedFrom references a match with bracket 'L' or came from L matches
          if (!op) return false;
          if (op.propagatedFrom) {
            const src = findMatch(bracketDoc, op.propagatedFrom);
            if (src && src.bracket === "L") return true;
          }
          // Fallback: check if op.label appears in any L matches as a participant
          return bracketDoc.matches.some((mm: any) => mm.bracket === "L" && ((mm.opponentA?.label && mm.opponentA.label === op.label) || (mm.opponentB?.label && mm.opponentB.label === op.label)));
        }

        const a = match.opponentA;
        const b = match.opponentB;
        const winnerIsA = match.winner === "A";
        const winnerOppObj = winnerIsA ? a : b;
        const loserOppObj = winnerIsA ? b : a;

        const winnerFromLB = isFromLoser(winnerOppObj);
        const loserFromLB = isFromLoser(loserOppObj);

        if (winnerFromLB && !loserFromLB) {
          // LB winner beat WB winner -> enable GF2 and put both contestants there
          let gf2 = findMatch(bracketDoc, "GF2");
          if (!gf2) {
            // create GF2
            bracketDoc.matches.push({
              id: "GF2",
              bracket: "F",
              round: 2,
              matchNumber: 1,
              opponentA: { ...a, propagatedFrom: null },
              opponentB: { ...b, propagatedFrom: null },
              scoreA: null,
              scoreB: null,
              winner: null,
              finished: false,
              winnerto: null,
              loserto: null,
              metadata: { reserved: false },
            });
          } else {
            // activate GF2 and set participants
            gf2.opponentA = { ...a, propagatedFrom: null };
            gf2.opponentB = { ...b, propagatedFrom: null };
            gf2.scoreA = null;
            gf2.scoreB = null;
            gf2.winner = null;
            gf2.finished = false;
            gf2.metadata = gf2.metadata || {};
            gf2.metadata.reserved = false;
          }
        }
      }

      await bracketDoc.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Return updated whole bracket for frontend to re-render
      const updated = await Bracket.findOne({ bracketId: params.bracketId }).lean();
      return NextResponse.json({ ok: true, bracket: updated }, { status: 200 });
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      console.error("resolve-result internal error:", err);
      return NextResponse.json({ error: err.message || "internal error" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("resolve-result error:", err);
    return NextResponse.json({ error: err.message || "internal error" }, { status: 500 });
  }
}
