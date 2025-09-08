// app/api/tournaments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Tournament from '@/lib/models/Tournament'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const items = await Tournament.find({ archivedAt: null })
      .select('name slug game status')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return NextResponse.json({ items }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
