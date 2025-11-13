import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bracketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bracketId } = await params;
    const body = await req.json();
    const { matchId, scheduledAt, scheduledEndAt, venue, streamUrl } = body;

    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    await connectDB();

    const bracket = await Bracket.findOne({ bracketId });
    if (!bracket) {
      return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
    }

    // Find and update the match
    const match = bracket.matches.find((m: any) => m.id === matchId);
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Update scheduling fields
    if (scheduledAt) match.scheduledAt = new Date(scheduledAt);
    if (scheduledEndAt) match.scheduledEndAt = new Date(scheduledEndAt);
    if (venue !== undefined) match.venue = venue;
    if (streamUrl !== undefined) match.streamUrl = streamUrl;
    
    // Update status
    if (scheduledAt) {
      match.status = "scheduled";
    }

    await bracket.save();

    return NextResponse.json({
      success: true,
      message: "Match scheduled successfully",
      match,
    });
  } catch (error: any) {
    console.error("Error scheduling match:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule match" },
      { status: 500 }
    );
  }
}
