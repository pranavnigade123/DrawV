// app/api/brackets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import { generateBracketSkeleton } from "@/lib/bracket/generateSkeleton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions).catch(() => null);
    const body = await req.json();
    const { tournamentId, format, participants } = body;

    if (!format || !["single_elim", "double_elim"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }
    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json({ error: "At least two participants required" }, { status: 400 });
    }

    const skeleton = generateBracketSkeleton(format, participants);
    const matches = skeleton.matches;
    const params = (skeleton as any).params || {};
    const bracketId = Math.random().toString(36).substring(2, 12);

    const bracketDoc = await Bracket.create({
      bracketId,
      tournamentId: tournamentId || null,
      ownerId: session?.user?.id || null,
      userId: session?.user?.id || null,
      format,
      participantsCount: participants.length,
      matches,
      params,
    });

    return NextResponse.json({
      success: true,
      message: "Bracket created successfully",
      bracket: JSON.parse(JSON.stringify(bracketDoc)),
    });
  } catch (err: any) {
    console.error("❌ Error creating bracket:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const brackets = await Bracket.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, brackets });
  } catch (err: any) {
    console.error("❌ Error fetching brackets:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
