"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import BracketViewer from "./BracketViewer";

interface BracketGeneratorProps {
  tournamentSlug?: string;
  userRole: "admin" | "player";
}

export default function BracketGenerator({ tournamentSlug, userRole }: BracketGeneratorProps) {
  const [teams, setTeams] = useState<string[]>([]);
  const [format, setFormat] = useState<"single_elim" | "double_elim">("double_elim");
  const [bracket, setBracket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch participants (teams or solo) when a tournament is selected
  useEffect(() => {
    async function fetchParticipants() {
      if (!tournamentSlug) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/tournaments/${tournamentSlug}/participants`);
        const data = await res.json();

        if (res.ok && data?.items?.length) {
          const names = data.items.map((p: any) => p.displayName);
          setTeams(names);
          toast.success(`Loaded ${names.length} participant${names.length > 1 ? "s" : ""}`);
        } else {
          setTeams([]);
          toast.error(data.error || "No participants found for this tournament");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load participants");
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [tournamentSlug]);

  // ✅ Manage teams manually
  const addTeam = () => setTeams((prev) => [...prev, `Team ${prev.length + 1}`]);
  const removeTeam = (i: number) => setTeams((prev) => prev.filter((_, index) => index !== i));
  const updateTeam = (i: number, val: string) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[i] = val;
      return copy;
    });
  };

  // ✅ Generate and save bracket immediately
  async function handleGenerateBracket() {
    const filteredTeams = teams.filter((t) => t.trim() !== "");
    if (filteredTeams.length < 2) {
      toast.error("Please add at least two participants.");
      return;
    }

    setLoading(true);
    try {
      // Save bracket directly to database
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournamentSlug || null,
          format,
          participants: filteredTeams,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success && data?.bracket) {
        setBracket({
          bracketId: data.bracket.bracketId,
          format: data.bracket.format,
          matches: data.bracket.matches,
        });
        toast.success("✅ Bracket created and saved!");
      } else {
        toast.error(data.error || "Failed to generate bracket");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while generating bracket");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Navigate to saved bracket
  function handleViewBracket() {
    if (!bracket?.bracketId) return;
    const url = userRole === "admin" 
      ? `/admin/brackets/${bracket.bracketId}`
      : `/dashboard/brackets/${bracket.bracketId}`;
    window.location.href = url;
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-3">Bracket Generator</h2>

      {tournamentSlug && (
        <p className="text-sm text-zinc-400 mb-3">
          Selected Tournament:{" "}
          <span className="text-indigo-400 font-medium">{tournamentSlug}</span>
        </p>
      )}

      {/* Format Selector */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as any)}
          className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2"
        >
          <option value="single_elim">Single Elimination</option>
          <option value="double_elim">Double Elimination</option>
        </select>
      </div>

      {/* Participants Input */}
      <div className="space-y-3 mb-4">
        <label className="block text-sm text-zinc-400 mb-1">Participants</label>
        {teams.length === 0 && (
          <p className="text-zinc-500 text-sm mb-2">
            No participants loaded — add manually below.
          </p>
        )}
        {teams.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={t}
              onChange={(e) => updateTeam(i, e.target.value)}
              placeholder={`Participant ${i + 1}`}
              className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 flex-1"
            />
            {teams.length > 2 && (
              <button
                onClick={() => removeTeam(i)}
                className="text-zinc-400 hover:text-red-400 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={addTeam} className="text-indigo-400 hover:text-indigo-300 text-sm">
          + Add Participant
        </button>
      </div>

      {/* Generate Bracket */}
      <button
        onClick={handleGenerateBracket}
        disabled={loading}
        className={`mt-2 px-4 py-2 rounded font-medium ${
          loading ? "bg-zinc-700" : "bg-indigo-600 hover:bg-indigo-500"
        } text-white`}
      >
        {loading ? "Generating..." : "Generate Bracket"}
      </button>

      {/* Show generated bracket */}
      {bracket && (
        <div className="mt-8 border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              Bracket Created ({bracket.format === "double_elim" ? "Double" : "Single"} Elimination)
            </h3>
            <button
              onClick={handleViewBracket}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              📊 Open Full View
            </button>
          </div>
          <BracketViewer bracketId={bracket.bracketId} matches={bracket.matches} isEditable />
        </div>
      )}
    </div>
  );
}
