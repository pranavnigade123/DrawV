import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Schedule from "@/lib/models/Schedule";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("📅 Fetching schedules for slug:", slug);
    
    await connectDB();

    const tournament = await Tournament.findOne({ slug, archivedAt: null }).lean();
    if (!tournament) {
      console.log("❌ Tournament not found for slug:", slug);
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    console.log("✅ Tournament found:", tournament._id);

    // Fetch all active schedules
    const schedules = await Schedule.find({
      tournamentId: tournament._id,
      isActive: true,
    })
      .sort({ publishedAt: -1 })
      .lean();

    console.log("📊 Found schedules:", schedules.length);
    console.log("Schedule details:", schedules);

    return NextResponse.json({
      success: true,
      schedules: schedules.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        description: s.description,
        matches: s.matches.map((m: any) => ({
          matchId: m.matchId,
          opponentA: m.opponentA,
          opponentB: m.opponentB,
          scheduledAt: m.scheduledAt,
          scheduledEndAt: m.scheduledEndAt,
          venue: m.venue,
          streamUrl: m.streamUrl,
          round: m.round,
          bracket: m.bracket,
        })),
        publishedAt: s.publishedAt,
      })),
    });
  } catch (error: any) {
    console.error("❌ Error fetching schedules:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}
