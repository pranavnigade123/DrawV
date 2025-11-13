import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Bracket from "@/lib/models/Brackets";
import Schedule from "@/lib/models/Schedule";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, matchIds } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectDB();

    // Get tournament
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (!tournament.bracketId) {
      return NextResponse.json({ error: "No bracket found" }, { status: 400 });
    }

    // Get bracket with matches
    const bracket = await Bracket.findOne({ bracketId: tournament.bracketId });
    if (!bracket) {
      return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
    }

    // Filter scheduled matches
    let matchesToPublish = bracket.matches.filter(
      (m: any) => m.scheduledAt && m.opponentA?.label && m.opponentB?.label
    );

    // If specific matchIds provided, filter to those
    if (matchIds && matchIds.length > 0) {
      matchesToPublish = matchesToPublish.filter((m: any) =>
        matchIds.includes(m.id)
      );
    }

    if (matchesToPublish.length === 0) {
      return NextResponse.json(
        { error: "No scheduled matches to publish" },
        { status: 400 }
      );
    }

    // Create new schedule (keep all schedules active)
    const schedule = await Schedule.create({
      tournamentId: tournament._id,
      bracketId: tournament.bracketId,
      title,
      description: description || null,
      matches: matchesToPublish.map((m: any) => ({
        matchId: m.id,
        opponentA: m.opponentA.label,
        opponentB: m.opponentB.label,
        scheduledAt: m.scheduledAt,
        scheduledEndAt: m.scheduledEndAt || null,
        venue: m.venue || null,
        streamUrl: m.streamUrl || null,
        round: m.round,
        bracket: m.bracket,
      })),
      publishedAt: new Date(),
      publishedBy: session.user.id,
      isActive: true, // All schedules remain active
    });

    return NextResponse.json({
      success: true,
      message: `Schedule published with ${matchesToPublish.length} matches`,
      schedule: {
        id: schedule._id,
        title: schedule.title,
        matchCount: schedule.matches.length,
        publishedAt: schedule.publishedAt,
      },
    });
  } catch (error: any) {
    console.error("Error publishing schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish schedule" },
      { status: 500 }
    );
  }
}

// GET: Fetch all published schedules for a tournament
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const schedules = await Schedule.find({ tournamentId: tournament._id })
      .sort({ publishedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      schedules: schedules.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        description: s.description,
        matchCount: s.matches.length,
        publishedAt: s.publishedAt,
        isActive: s.isActive,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a published schedule
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID required" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Schedule.findByIdAndDelete(scheduleId);
    if (!deleted) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
