import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { generateBracketFromTournament } from "@/lib/services/bracketService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const seedingMethod = body.seedingMethod || "registration_order";
    const bracketFormat = body.bracketFormat || "single_elim";
    const manualParticipants = body.manualParticipants;

    // Validate seeding method
    if (!["random", "registration_order"].includes(seedingMethod)) {
      return NextResponse.json(
        { error: "Invalid seeding method" },
        { status: 400 }
      );
    }

    // Validate bracket format
    if (!["single_elim", "double_elim"].includes(bracketFormat)) {
      return NextResponse.json(
        { error: "Invalid bracket format" },
        { status: 400 }
      );
    }

    // Generate bracket
    const result = await generateBracketFromTournament(
      id, 
      seedingMethod, 
      manualParticipants,
      bracketFormat
    );

    return NextResponse.json({
      success: true,
      message: "Bracket generated successfully",
      bracketId: result.bracket.bracketId,
      participantsCount: result.participantsCount,
    });
  } catch (error: any) {
    console.error("Error generating bracket:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bracket" },
      { status: 500 }
    );
  }
}
