import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/models/mongodb";
import Registration from "@/lib/models/Registration";
import User from "@/lib/models/User";
import Tournament from "@/lib/models/Tournament";
import { ensureAdmin } from "@/lib/authz";

export async function POST(req: Request) {
  try {
    await ensureAdmin();
    await connectDB();

    const { tournamentSlug, message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    let recipients: string[] = [];

    if (tournamentSlug) {
      const t = await Tournament.findOne({ slug: tournamentSlug }).select("_id").lean();
      if (!t?._id) {
        return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
      }
      const regs = await Registration.find({ tournamentId: t._id }).lean();
      recipients = regs
        .map((r: any) => r?.solo?.email || r?.team?.leader?.email)
        .filter(Boolean);
    } else {
      const users = await User.find({}, { email: 1 }).lean();
      recipients = users.map((u: any) => u.email).filter(Boolean);
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Draw V Admin" <${process.env.SMTP_USER}>`,
      to: recipients.join(","),
      subject: tournamentSlug ? "Tournament Update" : "Draw V Announcement",
      text: message,
    });

    return NextResponse.json({ success: true, count: recipients.length });
  } catch (err) {
    console.error("email-blast error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
