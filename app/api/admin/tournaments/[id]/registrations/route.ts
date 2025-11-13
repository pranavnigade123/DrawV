// app/api/admin/tournaments/[id]/registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Registration from "@/lib/models/Registration";
import mongoose from "mongoose";

/**
 * GET /api/admin/tournaments/[id]/registrations
 * Get all registrations for a tournament
 */
export async function GET(
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

    const registrations = await Registration.find({
      tournamentId: new mongoose.Types.ObjectId(id),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      registrations: registrations.map((reg) => ({
        ...reg,
        _id: reg._id.toString(),
        tournamentId: reg.tournamentId.toString(),
      })),
    });
  } catch (error: any) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
