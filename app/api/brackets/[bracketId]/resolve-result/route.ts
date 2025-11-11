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
  bracketDoc.matches.forEach((m: any) => {
    ["opponentA", "opponentB"].forEach((slotKey) => {
      const slot = m[slotKey];
      if (slot && slot.propagatedFrom === sourceMatchId) {
        m[slotKey] = { type: "placeholder", label: null, propagatedFrom: null };
      }
    });
  });
}

/* -------------------------------------------------------------
   ✅ POST Handler (with awaited params + proper export)
------------------------------------------------------------- */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ bracketId: string }> }
) {
  try {
    const { bracketId } = await context.params; // ✅ await params for dynamic route
    console.log("🧠 Received bracketId:", bracketId);

    await connectDB();

    const body = await req.json();
    const { matchId, scoreA, scoreB, force = false } = body;

    // 🔹 Validation
    if (!bracketId) return NextResponse.json({ error: "Missing bracketId" }, { status: 400 });
    if (!matchId) return NextResponse.json({ error: "matchId required" }, { status: 400 });
    if (typeof scoreA !== "number" || typeof scoreB !== "number")
      return NextResponse.json({ error: "scores required" }, { status: 400 });
    if (scoreA === scoreB) return NextResponse.json({ error: "tie not supported" }, { status: 400 });

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bracketDoc = await Bracket.findOne({ bracketId }).session(session);
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

      // 🧩 Idempotent check
      if (match.finished && match.winner === newWinnerSide && match.scoreA === scoreA && match.scoreB === scoreB) {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json({ ok: true, message: "No changes (idempotent)" }, { status: 200 });
      }

      // 🧩 Clear downstream if result changes
      const priorFinished = match.finished;
      const priorWinner = match.winner;
      if (priorFinished && priorWinner && priorWinner !== newWinnerSide) {
        const toClear = new Set<string>();
        bracketDoc.matches.forEach((mm: any) => {
          ["opponentA", "opponentB"].forEach((slotKey) => {
            const slot = mm[slotKey];
            if (slot && slot.propagatedFrom === match.id) {
              mm[slotKey] = { type: "placeholder", label: null, propagatedFrom: null };
              toClear.add(mm.id);
            }
          });
        });

        // recursive clearing
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

      // 🧩 Update match
      match.scoreA = scoreA;
      match.scoreB = scoreB;
      match.winner = newWinnerSide;
      match.finished = true;

      const winnerOpp = newWinnerSide === "A" ? match.opponentA : match.opponentB;
      const loserOpp = newLoserSide === "A" ? match.opponentA : match.opponentB;

      // 🧩 Helper to place winner/loser
      function placeToTarget(targetId: string | null, team: any, fromMatchId: string, expectedSlot?: "A" | "B") {
        if (!targetId) return { ok: false, reason: "no target" };
        const targetMatch: any = findMatch(bracketDoc, targetId);
        if (!targetMatch) return { ok: false, reason: "target not found" };

        let slotToUse: "A" | "B" | null = expectedSlot || null;

        if (!slotToUse) {
          if (!targetMatch.opponentA?.label || targetMatch.opponentA.type === "placeholder") slotToUse = "A";
          else if (!targetMatch.opponentB?.label || targetMatch.opponentB.type === "placeholder") slotToUse = "B";
        }

        if (!slotToUse) {
          if (!force) return { ok: false, reason: "no empty slot" };
          slotToUse = "B";
        }

        const slotKey = slotName(slotToUse);
        const existing = targetMatch[slotKey];
        if (existing && existing.label && existing.label === team.label) return { ok: true, placed: false };

        targetMatch[slotKey] = { ...team, propagatedFrom: fromMatchId };
        return { ok: true, placed: true, slot: slotToUse };
      }

      // 🧩 Propagate winner + loser
      if (match.winnerto) placeToTarget(match.winnerto, winnerOpp, match.id, match.metadata?.winnerExpectedSlot);
      if (match.loserto) placeToTarget(match.loserto, loserOpp, match.id, match.metadata?.loserExpectedSlot);

      // 🏁 GF1 → GF2 logic
      if (match.id === "GF1") {
        function isFromLoser(op: any) {
          if (!op) return false;
          if (op.propagatedFrom) {
            const src = findMatch(bracketDoc, op.propagatedFrom);
            if (src && src.bracket === "L") return true;
          }
          return bracketDoc.matches.some(
            (mm: any) =>
              mm.bracket === "L" &&
              ((mm.opponentA?.label === op.label) || (mm.opponentB?.label === op.label))
          );
        }

        const a = match.opponentA;
        const b = match.opponentB;
        const winnerIsA = match.winner === "A";
        const winnerOppObj = winnerIsA ? a : b;
        const loserOppObj = winnerIsA ? b : a;

        const winnerFromLB = isFromLoser(winnerOppObj);
        const loserFromLB = isFromLoser(loserOppObj);

        if (winnerFromLB && !loserFromLB) {
          let gf2 = findMatch(bracketDoc, "GF2");
          if (!gf2) {
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

      const updated = await Bracket.findOne({ bracketId }).lean();
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
