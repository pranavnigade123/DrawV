// app/tools/bracket/page.tsx (or app/(dashboard)/brackets/page.tsx)
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import BracketGenerator from "@/components/brackets/BracketGenerator";
import toast from "react-hot-toast";

type Bracket = {
  bracketId: string;
  format: string;
  participantsCount?: number;
  params?: { participantsCount?: number };
  createdAt: string;
};

export default function BracketPage() {
  const { data: session, status } = useSession();
  const [tournaments, setTournaments] = useState<{ slug: string; name: string }[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [newName, setNewName] = useState("");
  const [loadingT, setLoadingT] = useState(false);
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loadingBrackets, setLoadingBrackets] = useState(false);

  const role = (session?.user?.role as string | undefined) ?? "player";

  // ✅ Load tournaments for admin
  useEffect(() => {
    async function load() {
      if (role !== "admin") return;
      setLoadingT(true);
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        const items = data.items || data.tournaments || [];
        const simplified = items.map((t: any) => ({ slug: t.slug, name: t.name }));
        setTournaments(simplified);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingT(false);
      }
    }
    load();
  }, [role]);

  // ✅ Create tournament (admin)
  async function createTournament() {
    if (!newName.trim()) {
      toast.error("Enter a tournament name");
      return;
    }
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error("Failed to create: " + (d.error || res.status));
        return;
      }
      toast.success("Tournament created!");
      setNewName("");
      const res2 = await fetch("/api/tournaments");
      const d2 = await res2.json();
      setTournaments((d2.items || d2.tournaments || []).map((t: any) => ({ slug: t.slug, name: t.name })));
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    }
  }

  // ✅ Load user brackets
  async function loadUserBrackets() {
    setLoadingBrackets(true);
    try {
      const res = await fetch("/api/brackets/my");
      const data = await res.json();
      if (res.ok) setBrackets(data);
      else toast.error(data.error || "Failed to load brackets");
    } catch (err) {
      console.error(err);
      toast.error("Could not load saved brackets");
    } finally {
      setLoadingBrackets(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadUserBrackets();
  }, [status]);

  // ✅ Delete bracket
  async function deleteBracket(bracketId: string) {
    if (!confirm("Delete this bracket permanently?")) return;
    const res = await fetch(`/api/brackets/${bracketId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted successfully");
      loadUserBrackets();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete");
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Bracket Generator</h1>
          <Link href="/public-tools" className="text-sm text-zinc-400 hover:text-white">
            Back to Tools
          </Link>
        </div>

        {/* Admin view */}
        {role === "admin" && (
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 mb-6">
            <label className="block text-sm text-zinc-300 mb-2">
              Select Tournament (admin only)
            </label>
            <div className="flex gap-3">
              <select
                value={selectedSlug ?? ""}
                onChange={(e) => setSelectedSlug(e.target.value || undefined)}
                className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2"
              >
                <option value="">— Choose a tournament —</option>
                {tournaments.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New tournament name"
                className="bg-zinc-800 text-white border border-zinc-700 rounded-lg px-3 py-2"
              />
              <button
                onClick={createTournament}
                className="px-3 py-2 rounded bg-indigo-600 text-white"
              >
                Create
              </button>
            </div>
            {loadingT && <div className="text-xs text-zinc-400 mt-2">Loading tournaments…</div>}
          </div>
        )}

        {/* Player info */}
        {role !== "admin" && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 mb-6 text-sm text-zinc-400">
            Build your bracket manually and it will automatically save to your dashboard.
          </div>
        )}

        {/* Bracket Generator */}
        <BracketGenerator
          tournamentSlug={role === "admin" ? selectedSlug : undefined}
          userRole={role as any}
        />

        {/* My Saved Brackets */}
        <div className="mt-10 border-t border-zinc-800 pt-6">
          <h2 className="text-lg font-semibold text-white mb-3">My Saved Brackets</h2>

          {loadingBrackets ? (
            <p className="text-zinc-400">Loading your brackets...</p>
          ) : brackets.length === 0 ? (
            <p className="text-zinc-400">You haven’t saved any brackets yet.</p>
          ) : (
            <div className="grid gap-3">
              {[...brackets]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .map((b) => (
                  <div
                    key={b.bracketId}
                    className="flex items-center justify-between bg-zinc-900/70 p-3 rounded-lg border border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        Bracket ID: {b.bracketId}
                      </p>
                      <p className="text-xs text-zinc-400 capitalize">
                        {b.format.replace("_", " ")} •{" "}
                        {b.participantsCount ||
                          b.params?.participantsCount ||
                          "?"}{" "}
                        teams
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Created {new Date(b.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/brackets/${b.bracketId}`}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteBracket(b.bracketId)}
                        className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
