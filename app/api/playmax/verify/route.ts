import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PlaymaxRegistration from '@/lib/models/PlaymaxCampusLeague';
import { ensureAdmin } from '@/lib/authz';

export async function POST(request: Request) {
  try {
    await ensureAdmin(); // Restrict to admins
    await connectDB();

    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const registration = await PlaymaxRegistration.findById(registrationId).lean();
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}