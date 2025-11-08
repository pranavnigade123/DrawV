// app/api/tournaments/[slug]/participants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: raw } = await params;
    const slug = raw?.toLowerCase();
    if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

    await connectDB();
    const t = await Tournament.findOne({ slug, archivedAt: null }).select("_id entryType").lean();
    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // return registrations (approved)
    const regs = await Registration.find({ tournamentId: t._id, status: "approved" })
      .select(t.entryType === "team" ? "team.name team.leader.userId" : "solo.userId solo.name")
      .lean();

    const items = regs.map((r: any) => {
      if (t.entryType === "team") {
        return { _id: r._id.toString(), displayName: r.team?.name || "Team", raw: r };
      }
      return { _id: r._id.toString(), displayName: r.solo?.name || "Player", raw: r };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("GET participants error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
