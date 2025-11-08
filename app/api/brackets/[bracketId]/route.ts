// app/api/brackets/[bracketId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets"; // ✅ ensure singular file name (not "Brackets")
import { applyMatchResult } from "@/lib/bracket/propagate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * GET /api/brackets/:bracketId
 * Fetch bracket by ID (anyone can view)
 */
export async function GET(req: NextRequest, { params }: { params: { bracketId: string } }) {
  try {
    await connectDB();
    const { bracketId } = params;
    const bracket = await Bracket.findOne({ bracketId }).lean();
    if (!bracket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(bracket, { status: 200 });
  } catch (err) {
    console.error("GET /api/brackets/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/brackets/:bracketId
 * Update bracket (only for the owner)
 */
export async function PATCH(req: NextRequest, { params }: { params: { bracketId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { bracketId } = params;
    const updates = await req.json();

    const bracket = await Bracket.findOneAndUpdate(
      { bracketId, userId: session.user.id }, // ✅ only owner can update
      updates,
      { new: true }
    ).lean();

    if (!bracket) {
      return NextResponse.json({ error: "Not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json(bracket, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/brackets/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/brackets/:bracketId
 * Only the bracket owner can delete
 */
export async function DELETE(req: NextRequest, { params }: { params: { bracketId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { bracketId } = params;

    const deleted = await Bracket.findOneAndDelete({
      bracketId,
      userId: session.user.id, // ✅ owner check
    });

    if (!deleted) {
      return NextResponse.json({ error: "Bracket not found or not owned by you" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/brackets/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/brackets/:bracketId/resolve-result
 * Apply match result + propagate (admin only or bracket owner)
 * body: { matchId, scoreA, scoreB, force? }
 */
export async function POST(req: NextRequest, { params }: { params: { bracketId: string } }) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Only allow this for `/resolve-result`
    if (!path.endsWith("/resolve-result")) {
      return NextResponse.json({ error: "Unsupported POST path" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { bracketId } = params;
    const body = await req.json();
    const { matchId, scoreA, scoreB, force = false } = body;

    if (!matchId || typeof scoreA !== "number" || typeof scoreB !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Fetch bracket (only if owned by user)
    const bracket = await Bracket.findOne({ bracketId, userId: session.user.id });
    if (!bracket) {
      return NextResponse.json({ error: "Bracket not found or not owned by you" }, { status: 404 });
    }

    await applyMatchResult(bracketId, matchId, scoreA, scoreB, { force });

    const updated = await Bracket.findOne({ bracketId }).lean();
    return NextResponse.json({ ok: true, bracket: updated }, { status: 200 });
  } catch (err: any) {
    console.error("POST /resolve-result error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 400 });
  }
}
