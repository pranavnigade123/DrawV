import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";
import { generateBracketSkeleton } from "@/lib/bracket/generateSkeleton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { tournamentId, format, participants } = body;

    if (!participants || participants.length < 2) {
      return NextResponse.json({ error: "At least 2 participants required" }, { status: 400 });
    }

    if (!["single_elim", "double_elim"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // ✅ Generate skeleton
    const skeleton = generateBracketSkeleton(format, participants);

    const participantsCount = participants.length; // ✅ define explicitly

    // ✅ If logged in, save to DB
    if (session?.user?.id) {
      const bracket = new Bracket({
        bracketId: skeleton.bracketId,
        userId: session.user.id,
        tournamentId: tournamentId || null,
        format,
        participantsCount, // ✅ fix: add required field
        matches: skeleton.matches,
        params: {}, // optional extra info
      });

      await bracket.save();
      console.log("✅ Bracket created successfully:", bracket.bracketId);
      return NextResponse.json(bracket, { status: 201 });
    }

    // ✅ Guest mode: no DB save
    return NextResponse.json({
      bracketId: skeleton.bracketId,
      format,
      participantsCount,
      matches: skeleton.matches,
      message: "Guest mode: bracket not saved (login to save)",
    });
  } catch (err: any) {
    console.error("Error creating bracket:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
