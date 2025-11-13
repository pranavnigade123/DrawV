// app/api/admin/tournaments/[id]/archive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import mongoose from "mongoose";

/**
 * POST /api/admin/tournaments/[id]/archive
 * Archive a tournament
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const tournament = await Tournament.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      { archivedAt: new Date() },
      { new: true }
    );

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Tournament archived successfully",
    });
  } catch (error: any) {
    console.error("Error archiving tournament:", error);
    return NextResponse.json(
      { error: error.message || "Failed to archive tournament" },
      { status: 500 }
    );
  }
}
