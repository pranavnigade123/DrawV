// app/dashboard/brackets/[bracketId]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BracketViewer from "@/components/brackets/BracketViewer";
import toast from "react-hot-toast";

interface Match {
  id: string;
  bracket: "W" | "L" | "F";
  round: number;
  matchNumber: number;
  opponentA: { type: "team" | "player" | "placeholder"; label?: string | null };
  opponentB: { type: "team" | "player" | "placeholder"; label?: string | null };
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  finished: boolean;
}

interface Bracket {
  bracketId: string;
  format: string;
  participantsCount: number;
  matches: Match[];
  createdAt: string;
}

export default function BracketDetailPage() {
  const params = useParams();
  const { bracketId } = params as { bracketId: string };

  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch bracket by ID
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/brackets/${bracketId}`);
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Bracket not found");
          setBracket(null);
        } else {
          setBracket(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bracket");
      } finally {
        setLoading(false);
      }
    }

    if (bracketId) load();
  }, [bracketId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white text-lg">
        Loading bracket...
      </main>
    );
  }

  if (!bracket) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl font-bold mb-2">Bracket Not Found</h1>
        <Link href="/tools/bracket" className="text-indigo-400 hover:underline">
          ← Back to Bracket Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bracket: {bracket.bracketId}
            </h1>
            <p className="text-sm text-zinc-400">
              Format: {bracket.format.replace("_", " ")} •{" "}
              {bracket.participantsCount} teams
            </p>
            <p className="text-xs text-zinc-500">
              Created {new Date(bracket.createdAt).toLocaleString()}
            </p>
          </div>
          <Link
            href="/tools/bracket"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Back
          </Link>
        </div>

        {/* Render bracket */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
          <BracketViewer
            bracketId={bracket.bracketId}
            matches={bracket.matches}
            isEditable={true}
          />
        </div>
      </div>
    </main>
  );
}
