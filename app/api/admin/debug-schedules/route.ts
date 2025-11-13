import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Schedule from "@/lib/models/Schedule";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const allSchedules = await Schedule.find({}).lean();

    return NextResponse.json({
      total: allSchedules.length,
      schedules: allSchedules.map((s: any) => ({
        id: s._id.toString(),
        tournamentId: s.tournamentId.toString(),
        bracketId: s.bracketId,
        title: s.title,
        matchCount: s.matches.length,
        isActive: s.isActive,
        publishedAt: s.publishedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
