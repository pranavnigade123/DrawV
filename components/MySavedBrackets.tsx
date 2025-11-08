"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MySavedBrackets() {
  const [brackets, setBrackets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMyBrackets() {
    const res = await fetch("/api/brackets/my");
    const data = await res.json();
    if (res.ok) setBrackets(data);
    setLoading(false);
  }

  async function handleDelete(bracketId: string) {
    const res = await fetch(`/api/brackets/${bracketId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Bracket deleted");
      fetchMyBrackets();
    } else {
      toast.error("Failed to delete bracket");
    }
  }

  useEffect(() => {
    fetchMyBrackets();
  }, []);

  if (loading) return <p className="text-zinc-400 mt-6">Loading your brackets...</p>;
  if (!brackets.length)
    return <p className="text-zinc-400 mt-6">No saved brackets yet. Generate one above!</p>;

  return (
    <div className="mt-10 border-t border-zinc-800 pt-6">
      <h2 className="text-lg font-semibold text-white mb-3">My Saved Brackets</h2>
      <div className="grid gap-3">
        {brackets.map((b) => (
          <div
            key={b.bracketId}
            className="flex items-center justify-between bg-zinc-900/70 p-3 rounded-lg border border-zinc-800"
          >
            <div>
              <p className="text-sm font-medium text-white">Bracket ID: {b.bracketId}</p>
              <p className="text-xs text-zinc-400 capitalize">
                {b.format.replace("_", " ")} • {b.params.participantsCount} teams
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
                onClick={() => handleDelete(b.bracketId)}
                className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
