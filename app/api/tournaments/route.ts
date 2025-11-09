// app/api/tournaments/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";

// 1. Force fresh execution on every request (NO Vercel caching)
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // 2. Only return tournaments that are NOT draft AND NOT archived
    const items = await Tournament.find({
      status: { $ne: "draft" },   // Hide drafts
      archivedAt: null,           // Hide archived
    })
      .select("name slug game status")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // 3. Return data + disable all caching
    return NextResponse.json(
      { items },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (e) {
    console.error("Tournaments API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}