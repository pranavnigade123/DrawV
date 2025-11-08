// components/brackets/BracketGenerator.tsx
"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import BracketViewer from "./BracketViewer";

interface BracketGeneratorProps {
  tournamentSlug?: string;
  userRole: "admin" | "player";
}

export default function BracketGenerator({ tournamentSlug, userRole }: BracketGeneratorProps) {
  const [teams, setTeams] = useState<string[]>([""]);
  const [format, setFormat] = useState<"single_elim" | "double_elim">("double_elim");
  const [bracket, setBracket] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // ✅ Add new team input
  const addTeam = () => {
    setTeams((prev) => [...prev, ""]);
  };

  // ✅ Remove team input
  const removeTeam = (index: number) => {
    setTeams((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Update team name
  const updateTeam = (index: number, value: string) => {
    setTeams((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // ✅ Generate bracket
  async function handleGenerateBracket() {
    const filteredTeams = teams.filter((t) => t.trim() !== "");
    if (filteredTeams.length < 2) {
      toast.error("Please add at least two teams.");
      return;
    }

    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournamentSlug,
          format,
          participants: filteredTeams,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate bracket");
        return;
      }

      console.log("Generated bracket data:", data);

      if (data && data.matches && Array.isArray(data.matches)) {
        toast.success("✅ Bracket generated successfully!");
        setBracket({
          bracketId: data.bracketId,
          format: data.format,
          matches: data.matches,
        });
      } else {
        console.error("Invalid bracket response:", data);
        toast.error("⚠️ Server did not return valid bracket matches.");
      }
    } catch (err) {
      console.error("Error generating bracket:", err);
      toast.error("Network error while generating bracket.");
    }
  }

  // ✅ Save bracket to user dashboard
  async function handleSaveBracket() {
    if (!bracket) return;
    setSaving(true);

    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournamentSlug,
          format: bracket.format,
          participants: teams,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Bracket saved to your dashboard!");
      } else {
        toast.error(data.error || "Failed to save bracket");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while saving bracket");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-3">Create a Bracket</h2>

      {/* Format selector */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">Format</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "single_elim" | "double_elim")}
          className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2"
        >
          <option value="single_elim">Single Elimination</option>
          <option value="double_elim">Double Elimination</option>
        </select>
      </div>

      {/* Team inputs */}
      <div className="space-y-3 mb-4">
        <label className="block text-sm text-zinc-400 mb-1">Teams</label>
        {teams.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={t}
              onChange={(e) => updateTeam(i, e.target.value)}
              placeholder={`Team ${i + 1}`}
              className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 flex-1"
            />
            {teams.length > 1 && (
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
          + Add Team
        </button>
      </div>

      <button
        onClick={handleGenerateBracket}
        className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium"
      >
        Generate Bracket
      </button>

      {/* Show save option */}
      {bracket && (
        <div className="mt-6 border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-300 mb-2">Save this bracket to your dashboard?</p>
          <div className="flex gap-3">
            <button
              onClick={handleSaveBracket}
              disabled={saving}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save to My Dashboard"}
            </button>
            <button
              onClick={() => setBracket(null)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Render the generated bracket below */}
      {bracket && bracket.matches && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4 text-white">
            Generated Bracket (Format: {bracket.format === "double_elim" ? "Double Elimination" : "Single Elimination"})
          </h3>
          <BracketViewer
            bracketId={String(bracket.bracketId)}
            isEditable={true}
          />
        </div>
      )}
    </div>
  );
}
