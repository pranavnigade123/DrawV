// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// 1. This forces Vercel to run the API fresh every time (NO CACHING)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
  const q = (searchParams.get("q") || "").trim();
  const role = (searchParams.get("role") || "").trim();

  const filter: Record<string, any> = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { provider: { $regex: q, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("name email role provider createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // 2. Disable all caching (browsers, CDN, Vercel edge)
  return NextResponse.json(
    {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}