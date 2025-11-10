// app/tournaments/[slug]/register/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";
import RegisterClient from "./RegisterClient"; // New client component

// SERVER COMPONENT
export default async function RegisterPageWrapper({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // BLOCK GUESTS: Redirect to login
  if (!userId) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/tournaments/${params.slug}/register`)}`);
  }

  await connectDB();

  // Fetch tournament
  const tournament = await Tournament.findOne({ slug: params.slug }).lean();
  if (!tournament || tournament.status !== "open") {
    redirect(`/tournaments/${params.slug}?msg=${encodeURIComponent("Registration is not open.")}`);
  }

  // Check if already registered
  const existing = await Registration.findOne({
    tournamentId: tournament._id,
    $or: [
      { "solo.userId": userId },
      { "team.leader.userId": userId },
    ],
    status: { $in: ["approved", "pending"] },
  }).lean();

  if (existing) {
    redirect(`/dashboard?msg=${encodeURIComponent("You are already registered for this tournament.")}`);
  }

  // Pass data to client component
  return (
    <RegisterClient
      tournament={{
        slug: tournament.slug,
        name: tournament.name,
        entryType: tournament.entryType,
        teamSize: tournament.teamSize ?? null,
        status: tournament.status,
      }}
      userId={userId}
    />
  );
}