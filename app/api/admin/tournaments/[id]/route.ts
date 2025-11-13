// app/api/admin/tournaments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import mongoose from "mongoose";

/**
 * PATCH /api/admin/tournaments/[id]
 * Update tournament details
 */
export async function PATCH(
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
    const updates = await req.json();

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;
    delete updates.slug; // Slug is auto-generated from name

    const tournament = await Tournament.findByIdAndUpdate(
      new mongoose.Types.ObjectId(id),
      updates,
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      tournament: {
        ...tournament.toObject(),
        _id: tournament._id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error updating tournament:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tournament" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tournaments/[id]
 * Delete a tournament permanently
 */
export async function DELETE(
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

    const tournament = await Tournament.findByIdAndDelete(
      new mongoose.Types.ObjectId(id)
    );

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // TODO: Also delete related data (registrations, brackets, etc.)
    // This should be done in a transaction or with cascade delete

    return NextResponse.json({
      success: true,
      message: "Tournament deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting tournament:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
