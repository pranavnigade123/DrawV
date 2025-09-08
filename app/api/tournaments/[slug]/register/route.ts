// app/api/tournaments/[slug]/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";
import { teamRegistrationSchema, validateTeamSizeStrict, soloRegistrationSchema } from "@/lib/validation/registration";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slug = params.slug?.toLowerCase();
    if (!slug) return NextResponse.json({ error: "Invalid tournament slug" }, { status: 400 });

    await connectDB();

    const t = await Tournament.findOne({ slug, archivedAt: null }).lean();
    if (!t) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (t.status !== "open") return NextResponse.json({ error: "Registration is not open for this tournament" }, { status: 400 });

    const body = await req.json();

    // TEAM
    if (t.entryType === "team") {
      const teamSize = Number((t as any).teamSize || 0);
      if (!Number.isInteger(teamSize) || teamSize < 2) {
        return NextResponse.json({ error: "Tournament team size is not configured properly" }, { status: 400 });
      }

      const parsed = teamRegistrationSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.issues?.[0]?.message || "Invalid input";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      const { teamName, leaderIGN, contactPhone, members } = parsed.data;

      const sizeErr = validateTeamSizeStrict(members.length, teamSize);
      if (sizeErr) return NextResponse.json({ error: sizeErr }, { status: 400 });

      const dup = await Registration.findOne({
        tournamentId: t._id,
        "team.leader.userId": session.user.id,
        status: { $in: ["pending", "approved"] },
      }).select("_id").lean();
      if (dup) return NextResponse.json({ error: "An active registration already exists for this tournament." }, { status: 400 });

      const doc = await Registration.create({
        tournamentId: t._id,
        tournamentSlug: slug,
        entryType: "team",
        team: {
          name: teamName,
          leader: {
            userId: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email!,
            ign: leaderIGN,
            phone: contactPhone ?? null,
          },
          members: members.map((m: any) => ({
            name: m.name,
            email: m.email.toLowerCase(),
            ign: m.ign,
          })),
          size: teamSize,
        },
        status: "pending",
        notes: null,
      });

      return NextResponse.json({ success: true, id: doc._id.toString() }, { status: 201 });
    }

    // SOLO
    if (t.entryType === "solo") {
      const parsed = soloRegistrationSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message || "Invalid input";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      const { ign, contactPhone } = parsed.data;

      const dup = await Registration.findOne({
        tournamentId: t._id,
        "solo.userId": session.user.id,
        status: { $in: ["pending", "approved"] },
      }).select("_id").lean();
      if (dup) return NextResponse.json({ error: "An active registration already exists for this tournament." }, { status: 400 });

      const doc = await Registration.create({
        tournamentId: t._id,
        tournamentSlug: slug,
        entryType: "solo",
        solo: {
          userId: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email!,
          ign,
          phone: contactPhone ?? null,
        },
        status: "pending",
        notes: null,
      });

      return NextResponse.json({ success: true, id: doc._id.toString() }, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported entry type" }, { status: 400 });
  } catch (e) {
    console.error("Register POST error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
