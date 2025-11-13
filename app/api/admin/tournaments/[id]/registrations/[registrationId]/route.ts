// app/api/admin/tournaments/[id]/registrations/[registrationId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Registration from "@/lib/models/Registration";
import mongoose from "mongoose";

/**
 * PATCH /api/admin/tournaments/[id]/registrations/[registrationId]
 * Update registration status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, registrationId } = await params;
    const { status } = await req.json();

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const registration = await Registration.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(registrationId),
        tournamentId: new mongoose.Types.ObjectId(id),
      },
      { status },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      registration: {
        ...registration.toObject(),
        _id: registration._id.toString(),
        tournamentId: registration.tournamentId.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update registration" },
      { status: 500 }
    );
  }
}
