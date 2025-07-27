import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()
    if (!email || !password) 
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })

    await connectDB()

    // Check if user already exists
    const existing = await User.findOne({ email })
    if (existing)
      return NextResponse.json({ error: "User exists" }, { status: 400 })

    // Hash password before saving!
    const hashed = await bcrypt.hash(password, 10)
    await User.create({ email, name, password: hashed, role: "player" })

    return NextResponse.json({ success: true })
  } catch (err) {
    // Always return error as JSON, never let it crash
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
