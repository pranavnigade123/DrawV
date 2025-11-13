import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      smtp: {
        host: process.env.SMTP_HOST || "NOT SET",
        port: process.env.SMTP_PORT || "NOT SET",
        user: process.env.SMTP_USER || "NOT SET",
        pass: process.env.SMTP_PASS ? `SET (${process.env.SMTP_PASS.length} characters)` : "NOT SET",
        fromName: process.env.SMTP_FROM_NAME || "NOT SET",
        fromEmail: process.env.SMTP_FROM_EMAIL || "NOT SET",
      },
      note: "If SMTP_PASS shows 'NOT SET' or wrong length, the .env.local file wasn't loaded correctly",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
