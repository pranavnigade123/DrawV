import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { registerModels } from "@/lib/models";
import Registration from "@/lib/models/Registration";

registerModels();

export async function GET() {
  await connectDB();

  try {
    const registrations = await Registration.find({})
      .populate({
        path: "tournamentId",
        select: "name game status",
      })
      .populate({
        path: "team.leader.userId",
        select: "name email",
      })
      .populate({
        path: "solo.userId",
        select: "name email",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
