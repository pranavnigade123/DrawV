import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: "Test email address required" }, { status: 400 });
    }

    // Check configuration
    const isConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: "Email not configured",
        message: "Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local",
        config: {
          SMTP_HOST: process.env.SMTP_HOST || "Not set",
          SMTP_PORT: process.env.SMTP_PORT || "Not set",
          SMTP_USER: process.env.SMTP_USER || "Not set",
          SMTP_PASS: process.env.SMTP_PASS ? "Set (hidden)" : "Not set",
        },
      });
    }

    // Create test transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Tournament System"}" <${
        process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      }>`,
      to: testEmail,
      subject: "Test Email - Tournament System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">✅ Email Configuration Successful!</h2>
          <p>This is a test email from your Tournament System.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
            <p style="margin: 4px 0;"><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || "587"}</p>
            <p style="margin: 4px 0;"><strong>From:</strong> ${process.env.SMTP_USER}</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            You can now send emails to tournament participants!
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || "587",
        user: process.env.SMTP_USER,
      },
    });
  } catch (error: any) {
    console.error("Test email error:", error);
    
    let errorMessage = error.message || "Unknown error";
    let helpText = "";

    if (error.code === "EAUTH") {
      helpText = "Authentication failed. For Gmail:\n" +
        "1. Enable 2-Factor Authentication\n" +
        "2. Generate an App Password at https://myaccount.google.com/apppasswords\n" +
        "3. Use the App Password (not your regular password) in SMTP_PASS";
    } else if (error.code === "ECONNECTION") {
      helpText = "Connection failed. Check your SMTP_HOST and SMTP_PORT settings.";
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      code: error.code,
      help: helpText,
      config: {
        SMTP_HOST: process.env.SMTP_HOST || "Not set",
        SMTP_PORT: process.env.SMTP_PORT || "Not set",
        SMTP_USER: process.env.SMTP_USER || "Not set",
        SMTP_PASS: process.env.SMTP_PASS ? "Set (hidden)" : "Not set",
      },
    }, { status: 500 });
  }
}
