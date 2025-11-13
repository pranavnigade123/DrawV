import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import Tournament from "@/lib/models/Tournament";

/**
 * GET /api/brackets/[bracketId]
 */
export async function GET(req: NextRequest, context: { params: Promise<{ bracketId: string }> }) {
  try {
    await connectDB();
    const { bracketId } = await context.params;

    const bracket = await Bracket.findOne({ bracketId }).lean();
    if (!bracket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(bracket, { status: 200 });
  } catch (err) {
    console.error("GET /api/brackets/[bracketId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/brackets/[bracketId]
 */
export async function PATCH(req: NextRequest, context: { params: Promise<{ bracketId: string }> }) {
  try {
    await connectDB();
    const { bracketId } = await context.params;

    const body = await req.json();
    const bracket = await Bracket.findOneAndUpdate({ bracketId }, body, { new: true });

    if (!bracket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if all real matches (excluding BYEs) are complete and auto-update tournament status
    const totalMatches = bracket.matches.filter((m: any) => {
      if (!m.opponentA?.label || !m.opponentB?.label) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    }).length;
    
    const finishedMatches = bracket.matches.filter((m: any) => {
      if (!m.finished) return false;
      
      // Exclude BYE matches
      const isByeMatch = m.opponentA.label === "BYE" || m.opponentB.label === "BYE";
      return !isByeMatch;
    }).length;
    
    if (totalMatches > 0 && finishedMatches === totalMatches) {
      // All real matches complete - update tournament status
      await Tournament.findOneAndUpdate(
        { bracketId, status: { $ne: "completed" } },
        { status: "completed" }
      );
    }

    return NextResponse.json(bracket.toObject(), { status: 200 });
  } catch (err) {
    console.error("PATCH /api/brackets/[bracketId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/brackets/[bracketId]
 */
export async function DELETE(req: NextRequest, context: { params: Promise<{ bracketId: string }> }) {
  try {
    await connectDB();
    const { bracketId } = await context.params;

    const deleted = await Bracket.findOneAndDelete({ bracketId });

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Bracket deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/brackets/[bracketId] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
