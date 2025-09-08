// app/api/tournaments/[slug]/basic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: raw } = await params; // Next 15: params is a Promise and must be awaited
    const slug = raw?.toLowerCase();

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    await connectDB();

    const t = await Tournament.findOne({ slug, archivedAt: null })
      .select("slug name entryType teamSize status")
      .lean();

    if (!t) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        slug: t.slug,
        name: t.name,
        entryType: t.entryType,
        teamSize: (t as any).teamSize ?? null,
        status: t.status,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("GET /api/tournaments/[slug]/basic error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
