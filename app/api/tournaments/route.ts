import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Tournament from '@/lib/models/Tournament' // define this Schema

export async function GET(req: NextRequest) {
  await connectDB()
  const tournaments = await Tournament.find()
  return NextResponse.json(tournaments)
}
