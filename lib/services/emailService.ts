// lib/services/emailService.ts
import nodemailer from "nodemailer";

// Check if email is configured
const isEmailConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

// Email configuration
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
async function sendEmail({ to, subject, html, text }: EmailOptions) {
  // Check if email is configured
  if (!isEmailConfigured || !transporter) {
    console.warn("⚠️ Email not configured. Skipping email to:", to);
    console.log("📧 Would have sent:", subject);
    return { 
      success: false, 
      error: "Email not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local" 
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Tournament System"}" <${
        process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
      }>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    console.log("✅ Email sent:", info.messageId, "to:", to);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error };
  }
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string }
) {
  const subject = `Registration Received - ${tournament.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Registration Received!</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering for <strong>${tournament.name}</strong>.</p>
      <p>Your registration is currently <strong>pending approval</strong>. You will receive another email once your registration has been reviewed.</p>
      <p>Tournament Details:</p>
      <ul>
        <li><strong>Tournament:</strong> ${tournament.name}</li>
        <li><strong>Status:</strong> Pending Approval</li>
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tournaments/${
    tournament.slug
  }" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Tournament
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        If you have any questions, please contact the tournament organizers.
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send registration approval email
 */
export async function sendRegistrationApproval(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string; startDate?: Date | null }
) {
  const subject = `Registration Approved - ${tournament.name}`;
  const startDateStr = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "TBA";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Registration Approved! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Great news! Your registration for <strong>${tournament.name}</strong> has been approved.</p>
      <p>You are now officially registered for the tournament!</p>
      <p>Tournament Details:</p>
      <ul>
        <li><strong>Tournament:</strong> ${tournament.name}</li>
        <li><strong>Start Date:</strong> ${startDateStr}</li>
        <li><strong>Status:</strong> ✅ Approved</li>
      </ul>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tournaments/${
    tournament.slug
  }" 
           style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Tournament Details
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Good luck in the tournament!
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send bracket published notification
 */
export async function sendBracketPublished(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string }
) {
  const subject = `Tournament Bracket Published - ${tournament.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Tournament Bracket is Live! 🏆</h2>
      <p>Hi ${userName},</p>
      <p>The bracket for <strong>${tournament.name}</strong> has been published!</p>
      <p>You can now view your matches and see who you'll be competing against.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tournaments/${
    tournament.slug
  }#bracket" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Bracket
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Check back regularly for match updates and results!
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send match scheduled notification
 */
export async function sendMatchScheduled(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string },
  match: {
    opponent: string;
    scheduledAt: Date;
    venue?: string;
  }
) {
  const subject = `Match Scheduled - ${tournament.name}`;
  const matchDate = new Date(match.scheduledAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Your Match Has Been Scheduled! ⏰</h2>
      <p>Hi ${userName},</p>
      <p>Your match in <strong>${tournament.name}</strong> has been scheduled.</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 8px 0;"><strong>Opponent:</strong> ${match.opponent}</p>
        <p style="margin: 8px 0;"><strong>Date & Time:</strong> ${matchDate}</p>
        ${match.venue ? `<p style="margin: 8px 0;"><strong>Venue:</strong> ${match.venue}</p>` : ""}
      </div>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tournaments/${
    tournament.slug
  }#bracket" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Full Schedule
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Make sure to be ready at the scheduled time. Good luck!
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send tournament announcement
 */
export async function sendTournamentAnnouncement(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string },
  announcement: {
    title: string;
    message: string;
  }
) {
  const subject = `${announcement.title} - ${tournament.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">${announcement.title}</h2>
      <p>Hi ${userName},</p>
      <div style="background-color: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        ${announcement.message}
      </div>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tournaments/${
    tournament.slug
  }" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
          View Tournament
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">
        Tournament: ${tournament.name}
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Batch send emails to multiple recipients
 */
export async function sendBatchEmails(
  recipients: Array<{ email: string; name: string }>,
  emailFunction: (email: string, name: string, ...args: any[]) => Promise<any>,
  ...args: any[]
) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const result = await emailFunction(recipient.email, recipient.name, ...args);
      results.push({ email: recipient.email, success: result.success });
      
      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      results.push({ email: recipient.email, success: false, error });
    }
  }

  return results;
}

/**
 * Send tournament completion notification
 */
export async function sendTournamentCompletion(
  userEmail: string,
  userName: string,
  tournament: { name: string; slug: string },
  placement?: number,
  champion?: string
) {
  const subject = `${tournament.name} - Tournament Complete!`;
  
  let congratsMessage = "";
  if (placement === 1) {
    congratsMessage = `<p style="color: #10B981; font-size: 18px; font-weight: bold;">🏆 Congratulations! You are the Champion! 🏆</p>`;
  } else if (placement === 2) {
    congratsMessage = `<p style="color: #6B7280; font-size: 18px; font-weight: bold;">🥈 Congratulations on 2nd Place! 🥈</p>`;
  } else if (placement === 3) {
    congratsMessage = `<p style="color: #D97706; font-size: 18px; font-weight: bold;">🥉 Congratulations on 3rd Place! 🥉</p>`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Tournament Complete!</h2>
      <p>Hi ${userName},</p>
      ${congratsMessage}
      <p><strong>${tournament.name}</strong> has concluded!</p>
      ${champion ? `<p>Champion: <strong>${champion}</strong></p>` : ""}
      <p>Final results and standings are now available.</p>
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/tournaments/${tournament.slug}/results" 
           style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Final Results
        </a>
      </div>
      <p>Thank you for participating!</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
      <p style="color: #6B7280; font-size: 12px;">
        This is an automated message from the tournament system.
      </p>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
}
