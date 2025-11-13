// app/api/admin/tournaments/[id]/export-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import { generateFinalStandings, getMatchHistory } from "@/lib/services/resultsService";

/**
 * GET /api/admin/tournaments/[id]/export-results
 * Export results as CSV
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

    await connectDB();
    const { id } = await params;

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const results = await generateFinalStandings(id);
    const matchHistory = await getMatchHistory(id);

    // Generate CSV content
    let csv = `${tournament.name} - Final Results\n\n`;
    csv += `Tournament Status: ${tournament.status}\n`;
    csv += `Completion: ${results.completionPercentage}%\n\n`;

    if (results.champion) {
      csv += `Champion: ${results.champion}\n\n`;
    }

    csv += `FINAL STANDINGS\n`;
    csv += `Rank,Participant,Wins,Losses,Matches Played,Win Rate\n`;
    results.standings.forEach((s) => {
      csv += `${s.placement},${s.participant},${s.wins},${s.losses},${s.matchesPlayed},${s.winRate.toFixed(1)}%\n`;
    });

    csv += `\n\nMATCH HISTORY\n`;
    csv += `Round,Bracket,Team A,Score A,Score B,Team B,Winner\n`;
    matchHistory.forEach((m) => {
      const winner = m.winner === "A" ? m.opponentA : m.opponentB;
      csv += `${m.round},${m.bracket},${m.opponentA},${m.scoreA},${m.scoreB},${m.opponentB},${winner}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${tournament.slug}-results.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting results:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export results" },
      { status: 500 }
    );
  }
}
