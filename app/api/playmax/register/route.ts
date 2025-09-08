// app/api/playmax/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import PlaymaxRegistration from "@/lib/models/PlaymaxCampusLeague";

const payloadSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Valid phone is required").max(20),
  dob: z.string().optional().nullable(), // ISO date string
  course: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  game: z.string().optional().nullable(),
  acceptTc: z.boolean().refine((v) => v === true, "You must accept T&C"),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => ({}));
    const parsed = payloadSchema.safeParse(raw);
    if (!parsed.success) {
      const msg: string = parsed.error.issues && parsed.error.issues.length > 0
        ? parsed.error.issues[0].message
        : "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const dob = d.dob ? new Date(d.dob) : null;
    if (dob && isNaN(dob.getTime())) {
      return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
    }

    await connectDB();

    const doc = await PlaymaxRegistration.create({
      name: d.name.trim(),
      email: d.email.trim().toLowerCase(),
      phone: d.phone.trim(),
      dob,
      course: d.course?.trim() || null,
      gender: d.gender?.trim() || null,
      year: d.year?.trim() || null,
      game: d.game?.trim() || null,
      acceptTc: d.acceptTc,
    });

    return NextResponse.json({ success: true, id: doc._id.toString() }, { status: 201 });
  } catch (e) {
    console.error("POST /api/playmax/register error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
