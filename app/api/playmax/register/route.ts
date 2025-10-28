import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import PlaymaxRegistration from "@/lib/models/PlaymaxCampusLeague";
import nodemailer from "nodemailer";
import QRCode from "qrcode";


const playmaxRegistrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  dob: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  game: z.string().optional().nullable(),
  acceptTc: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = playmaxRegistrationSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => issue.message).join("; ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    const { name, email, phone, dob, course, gender, year, game, acceptTc } = parsed.data;

    // Check for duplicate email
    const existing = await PlaymaxRegistration.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Create registration
    const registration = await PlaymaxRegistration.create({
      name,
      email: email.toLowerCase(),
      phone,
      dob: dob ? new Date(dob) : null,
      course: course || null,
      gender: gender || null,
      year: year || null,
      game: game || null,
      acceptTc,
    });

    // Generate QR code with registration _id
    const qrData = registration._id.toString();
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 200,
    });

    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Draw V" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "PlayMax Campus League Registration Successful",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B56FD;">Welcome to PlayMax Campus League!</h2>
          <p>Dear ${name},</p>
          <p>Your registration for the PlayMax Campus League has been successfully completed!</p>
          <p><strong>Registration Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            ${game ? `<li><strong>Game:</strong> ${game}</li>` : ""}
          </ul>
          <p>Below is your unique QR code for verification at the event. Please save or print this email.</p>
          <img src="${qrCodeDataUrl}" alt="Verification QR Code" style="margin: 20px 0; max-width: 200px;" />
          <p>We look forward to seeing you at the event!</p>
          <p>Best regards,<br />The Draw V Team</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Registration successful! Check your email for confirmation and QR code." }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}