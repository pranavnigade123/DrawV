// app/api/tournaments/[slug]/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { generateFinalStandings, getMatchHistory } from "@/lib/services/resultsService";

// Cache results for 30 seconds to improve performance
export const revalidate = 30;

/**
 * GET /api/tournaments/[slug]/results
 * Public endpoint to view tournament results
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    const tournament = await Tournament.findOne({ slug }).lean();
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Check if results are published
    if (!tournament.resultsPublished) {
      return NextResponse.json(
        { error: "Results not yet published" },
        { status: 403 }
      );
    }

    // Get results
    const results = await generateFinalStandings(tournament._id.toString());
    const matchHistory = await getMatchHistory(tournament._id.toString());

    return NextResponse.json({
      tournament: {
        name: tournament.name,
        slug: tournament.slug,
        status: tournament.status,
      },
      ...results,
      matchHistory,
    });
  } catch (error: any) {
    console.error("Error fetching public results:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch results" },
      { status: 500 }
    );
  }
}
