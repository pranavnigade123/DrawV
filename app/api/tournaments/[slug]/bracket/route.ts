import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: raw } = await params;
    const slug = raw?.toLowerCase();
    if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

    await connectDB();
    const t = await Tournament.findOne({ slug, archivedAt: null }).select("bracket name").lean();
    if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ bracket: t.bracket ?? null, name: t.name });
  } catch (e) {
    console.error("GET /api/tournaments/[slug]/bracket error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { slug: raw } = await params;
    const slug = raw?.toLowerCase();
    if (!slug) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

    const body = await req.json();
    if (!body?.bracket) {
      return NextResponse.json({ error: "Missing bracket" }, { status: 400 });
    }

    await connectDB();
    const updated = await Tournament.findOneAndUpdate(
      { slug, archivedAt: null },
      { bracket: body.bracket, format: body.format },
      { new: true }
    ).select("slug").lean();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/tournaments/[slug]/bracket error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
