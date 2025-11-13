import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Bracket from "@/lib/models/Brackets";
import Registration from "@/lib/models/Registration";
import { toggleBracketPublish } from "@/lib/services/bracketService";
import { sendBatchEmails, sendBracketPublished } from "@/lib/services/emailService";

// GET: Fetch bracket for a tournament
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const tournament = await Tournament.findById(id).lean();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (!tournament.bracketId) {
      return NextResponse.json({ error: "No bracket found" }, { status: 404 });
    }

    const bracket = await Bracket.findOne({ bracketId: tournament.bracketId }).lean();
    if (!bracket) {
      return NextResponse.json({ error: "Bracket not found" }, { status: 404 });
    }

    return NextResponse.json({
      bracket,
      tournament: {
        id: tournament._id,
        name: tournament.name,
        bracketPublished: tournament.bracketPublished,
      },
    });
  } catch (error: any) {
    console.error("Error fetching bracket:", error);
    return NextResponse.json(
      { error: "Failed to fetch bracket" },
      { status: 500 }
    );
  }
}

// PATCH: Update bracket settings (publish/unpublish)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (typeof body.publish !== "boolean") {
      return NextResponse.json(
        { error: "Invalid publish value" },
        { status: 400 }
      );
    }

    const tournament = await toggleBracketPublish(id, body.publish);

    // Send emails to participants when bracket is published
    if (body.publish) {
      try {
        const registrations = await Registration.find({
          tournamentId: tournament._id,
          status: "approved",
        }).lean();

        const recipients = registrations
          .map((reg) => {
            if (reg.entryType === "team") {
              return {
                email: reg.team?.leader?.email || "",
                name: reg.team?.leader?.name || reg.team?.name || "Team",
              };
            } else {
              return {
                email: reg.solo?.email || "",
                name: reg.solo?.name || reg.solo?.ign || "Player",
              };
            }
          })
          .filter((r) => r.email);

        if (recipients.length > 0) {
          // Send emails in background (don't wait)
          sendBatchEmails(recipients, sendBracketPublished, {
            name: tournament.name,
            slug: tournament.slug,
          }).catch((err) => console.error("Error sending bracket emails:", err));
        }
      } catch (emailError) {
        console.error("Error sending bracket published emails:", emailError);
        // Don't fail the request if emails fail
      }
    }

    return NextResponse.json({
      success: true,
      message: body.publish ? "Bracket published" : "Bracket unpublished",
      bracketPublished: tournament.bracketPublished,
    });
  } catch (error: any) {
    console.error("Error updating bracket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update bracket" },
      { status: 500 }
    );
  }
}

// DELETE: Remove bracket reference from tournament
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Clear bracket references
    tournament.bracketId = null;
    tournament.bracketGenerated = false;
    tournament.bracketPublished = false;
    await tournament.save();

    return NextResponse.json({
      success: true,
      message: "Bracket reference cleared",
    });
  } catch (error: any) {
    console.error("Error clearing bracket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear bracket" },
      { status: 500 }
    );
  }
}
