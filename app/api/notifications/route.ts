// app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";

// GET - Fetch active notifications
export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const notifications = await Notification.find({
      isActive: true,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
    }).sort({ priority: -1, createdAt: -1 });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create new notification (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { title, message, type, priority, dismissible, expiresAt, link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      priority: priority || "medium",
      dismissible: dismissible !== false,
      createdBy: (session.user as any).id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      link,
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
