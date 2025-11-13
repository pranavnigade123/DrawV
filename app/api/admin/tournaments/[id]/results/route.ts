// app/api/admin/tournaments/[id]/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  generateFinalStandings,
  toggleResultsPublish,
  getMatchHistory,
} from "@/lib/services/resultsService";

/**
 * GET /api/admin/tournaments/[id]/results
 * Get tournament results and standings
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const results = await generateFinalStandings(id);
    const matchHistory = await getMatchHistory(id);

    return NextResponse.json({
      ...results,
      matchHistory,
    });
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch results" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/tournaments/[id]/results
 * Publish or unpublish results
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { publish } = await req.json();

    if (typeof publish !== "boolean") {
      return NextResponse.json(
        { error: "publish field must be a boolean" },
        { status: 400 }
      );
    }

    const tournament = await toggleResultsPublish(id, publish);

    return NextResponse.json({
      success: true,
      resultsPublished: tournament.resultsPublished,
      message: publish ? "Results published" : "Results unpublished",
    });
  } catch (error: any) {
    console.error("Error updating results:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update results" },
      { status: 500 }
    );
  }
}
