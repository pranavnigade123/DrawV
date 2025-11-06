// app/api/me/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

interface LeanUser {
  _id: unknown;
  name?: string;
  email?: string;
  role: string;
  phone?: string;
  ign?: string;
  createdAt?: Date;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = (await User.findById(session.user.id)
      .select("name email role phone ign createdAt")
      .lean()) as LeanUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          id: String(user._id),
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role,
          phone: user.phone ?? "",
          ign: user.ign ?? "",
          createdAt: user.createdAt ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

type UpdateBody = {
  name?: string;
  phone?: string;
  ign?: string;
};

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as UpdateBody;

    const payload: UpdateBody = {};

    if (typeof body.name === "string") {
      payload.name = body.name.trim().slice(0, 80);
    }
    if (typeof body.phone === "string") {
      payload.phone = body.phone.trim().slice(0, 32);
    }
    if (typeof body.ign === "string") {
      payload.ign = body.ign.trim().slice(0, 40);
    }

    await connectDB();

    const user = (await User.findByIdAndUpdate(
      session.user.id,
      { $set: payload },
      { new: true }
    )
      .select("name email role phone ign createdAt")
      .lean()) as LeanUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        profile: {
          id: String(user._id),
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role,
          phone: user.phone ?? "",
          ign: user.ign ?? "",
          createdAt: user.createdAt ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/me/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
