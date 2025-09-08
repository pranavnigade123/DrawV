// app/api/me/registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Registration from "@/lib/models/Registration";
import Tournament from "@/lib/models/Tournament";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const regs = await Registration.find({
      $or: [
        { "team.leader.userId": session.user.id },
        { "solo.userId": session.user.id },
      ],
    })
      .select("entryType status team solo tournamentId")
      .sort({ createdAt: -1 })
      .lean();

    const tIds = regs.map((r: any) => r.tournamentId);
    const tMap = new Map(
      (await Tournament.find({ _id: { $in: tIds } }).select("name").lean()).map((t: any) => [String(t._id), t.name])
    );

    const items = regs.map((r: any) => ({
      _id: String(r._id),
      entryType: r.entryType,
      status: r.status,
      tournamentId: String(r.tournamentId),
      tournamentName: tMap.get(String(r.tournamentId)) || "Tournament",
      team: r.team ? { name: r.team.name } : undefined,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("GET /api/me/registrations error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
