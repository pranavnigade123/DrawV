import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import UserBracket from "@/lib/models/UserBracket";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const brackets = await UserBracket.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("name createdAt _id")
      .lean();

    return NextResponse.json({ brackets });
  } catch (e) {
    console.error("GET /api/user/brackets error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, bracket, format } = await req.json();
    if (!bracket) {
      return NextResponse.json({ error: "Missing bracket data" }, { status: 400 });
    }

    await connectDB();
    const doc = await UserBracket.create({
      userId: session.user.id,
      name: name || `Bracket ${new Date().toLocaleString()}`,
      bracket,
      format,
    });

    return NextResponse.json({ ok: true, id: String((doc as any)._id) });
  } catch (e) {
    console.error("POST /api/user/brackets error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
