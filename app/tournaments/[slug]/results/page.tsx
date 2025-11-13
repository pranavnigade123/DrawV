// app/tournaments/[slug]/results/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import ResultsViewer from "@/components/tournaments/ResultsViewer";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const tournament = await Tournament.findOne({ slug }).lean();

  if (!tournament) {
    return { title: "Tournament Not Found" };
  }

  return {
    title: `${tournament.name} - Results | DrawV`,
    description: `View final results and standings for ${tournament.name}`,
  };
}

export default async function TournamentResultsPage({ params }: PageProps) {
  await connectDB();
  const { slug } = await params;

  const tournament = await Tournament.findOne({ slug }).lean();

  if (!tournament) {
    notFound();
  }

  // Check if results are published
  if (!tournament.resultsPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/tournaments/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tournament
          </Link>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Results Not Available</h1>
            <p className="text-zinc-400 text-lg">
              Results for this tournament have not been published yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if bracket exists
  if (!tournament.bracketId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/tournaments/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-8"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tournament
          </Link>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">No Results Available</h1>
            <p className="text-zinc-400 text-lg">
              This tournament does not have a bracket yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/tournaments/${slug}`}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tournament
          </Link>

          <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
          <p className="text-xl text-zinc-400">
            {tournament.status === "completed" ? "Final Results & Standings" : "Current Standings"}
          </p>
          {tournament.status !== "completed" && (
            <p className="text-sm text-zinc-500 mt-2">
              Tournament in progress - standings update as matches are completed
            </p>
          )}
        </div>

        {/* Results Viewer */}
        <ResultsViewer bracketId={tournament.bracketId} showChampion={true} />
      </div>
    </div>
  );
}
