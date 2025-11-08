import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Bracket from "@/lib/models/Brackets";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const brackets = await Bracket.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(brackets);
  } catch (err: any) {
    console.error("Error fetching user brackets:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
