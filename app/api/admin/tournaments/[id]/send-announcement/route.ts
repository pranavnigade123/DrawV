import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";
import { sendBatchEmails, sendTournamentAnnouncement } from "@/lib/services/emailService";

export async function POST(
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
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get tournament
    const tournament = await Tournament.findById(id).lean();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Get all approved registrations
    const registrations = await Registration.find({
      tournamentId: tournament._id,
      status: "approved",
    }).lean();

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: "No approved registrations to send to" },
        { status: 400 }
      );
    }

    // Extract recipient emails
    const recipients = registrations.map((reg) => {
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
    }).filter((r) => r.email);

    // Send emails in batch
    const results = await sendBatchEmails(
      recipients,
      sendTournamentAnnouncement,
      {
        name: tournament.name,
        slug: tournament.slug,
      },
      {
        title,
        message,
      }
    );

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${successCount} participants`,
      details: {
        total: recipients.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error: any) {
    console.error("Error sending announcement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send announcement" },
      { status: 500 }
    );
  }
}
