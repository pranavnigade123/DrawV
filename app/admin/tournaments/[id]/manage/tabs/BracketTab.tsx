"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ManualParticipant {
  id: string;
  name: string;
}

export default function BracketTab({ tournament }: { tournament: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedingMethod, setSeedingMethod] = useState<"registration_order" | "random">(
    "registration_order"
  );
  const [bracketFormat, setBracketFormat] = useState<"single_elim" | "double_elim">(
    tournament.format || "single_elim"
  );
  const [manualParticipants, setManualParticipants] = useState<ManualParticipant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [registeredTeams, setRegisteredTeams] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Fetch registered teams
  useEffect(() => {
    async function fetchRegisteredTeams() {
      setLoadingTeams(true);
      try {
        const res = await fetch(`/api/tournaments/${tournament.slug}/participants`);
        const data = await res.json();
        
        if (res.ok && data?.items) {
          const teamNames = data.items
            .filter((p: any) => p.status === "approved")
            .map((p: any) => p.displayName);
          setRegisteredTeams(teamNames);
        }
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoadingTeams(false);
      }
    }

    if (!tournament.bracketGenerated) {
      fetchRegisteredTeams();
    }
  }, [tournament.slug, tournament.bracketGenerated]);

  const addManualParticipant = () => {
    if (!newParticipantName.trim()) return;
    
    const newParticipant: ManualParticipant = {
      id: `manual-${Date.now()}`,
      name: newParticipantName.trim(),
    };
    
    setManualParticipants([...manualParticipants, newParticipant]);
    setNewParticipantName("");
  };

  const removeManualParticipant = (id: string) => {
    setManualParticipants(manualParticipants.filter((p) => p.id !== id));
  };

  const handleGenerateBracket = async () => {
    const totalParticipants = registeredTeams.length + manualParticipants.length;
    
    if (totalParticipants < 2) {
      setError("Need at least 2 participants to generate bracket");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/generate-bracket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          seedingMethod,
          bracketFormat,
          manualParticipants: manualParticipants.length > 0 ? manualParticipants : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate bracket");
      }

      // Refresh the page to show updated bracket status
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/tournaments/${tournament._id}/bracket`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !tournament.bracketPublished }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update bracket");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBracket = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-yellow-400">⚠️ Regenerate Bracket?</p>
          <p className="text-sm text-zinc-400">This will delete all current match results!</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
            >
              Regenerate
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1 bg-zinc-700 text-white rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ), { duration: Infinity });
    });

    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      // First, update tournament to remove bracket reference
      const updateRes = await fetch(`/api/admin/tournaments/${tournament._id}/bracket`, {
        method: "DELETE",
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "Failed to clear bracket reference");
      }

      // Then delete the bracket itself
      const deleteRes = await fetch(`/api/brackets/${tournament.bracketId}`, {
        method: "DELETE",
      });

      if (!deleteRes.ok) {
        console.warn("Bracket deletion failed, but continuing...");
      }

      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh to show generation UI again
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {!tournament.bracketGenerated ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generate Bracket</h3>
          <p className="text-zinc-400 mb-6">
            Generate a tournament bracket from approved registrations.
          </p>

          {/* Registered Teams */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Registered Teams ({registeredTeams.length})
            </label>
            {loadingTeams ? (
              <div className="text-sm text-zinc-500">Loading teams...</div>
            ) : registeredTeams.length > 0 ? (
              <div className="bg-zinc-800/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {registeredTeams.map((team, idx) => (
                    <div key={idx} className="text-sm text-zinc-300 flex items-center gap-2">
                      <span className="text-indigo-400">{idx + 1}.</span>
                      {team}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-amber-400 bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                No approved registrations yet. Add manual participants below or approve registrations first.
              </div>
            )}
          </div>

          {/* Manual Participants */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Add Last-Minute Participants (Optional)
            </label>
            <p className="text-sm text-zinc-500 mb-3">
              Add teams/players that registered outside the system
            </p>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addManualParticipant()}
                placeholder="Enter team/player name"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addManualParticipant}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add
              </button>
            </div>

            {manualParticipants.length > 0 && (
              <div className="space-y-2">
                {manualParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg"
                  >
                    <span className="text-white">{participant.name}</span>
                    <button
                      onClick={() => removeManualParticipant(participant.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bracket Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Bracket Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800">
                <input
                  type="radio"
                  name="format"
                  value="single_elim"
                  checked={bracketFormat === "single_elim"}
                  onChange={(e) => setBracketFormat(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="text-white font-medium">Single Elimination</div>
                  <div className="text-sm text-zinc-400">
                    One loss and you're out - faster tournament
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800">
                <input
                  type="radio"
                  name="format"
                  value="double_elim"
                  checked={bracketFormat === "double_elim"}
                  onChange={(e) => setBracketFormat(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="text-white font-medium">Double Elimination</div>
                  <div className="text-sm text-zinc-400">
                    Two losses to be eliminated - more fair
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Seeding Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Seeding Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800">
                <input
                  type="radio"
                  name="seeding"
                  value="registration_order"
                  checked={seedingMethod === "registration_order"}
                  onChange={(e) => setSeedingMethod(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="text-white font-medium">Registration Order</div>
                  <div className="text-sm text-zinc-400">
                    First-come-first-serve (recommended)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800">
                <input
                  type="radio"
                  name="seeding"
                  value="random"
                  checked={seedingMethod === "random"}
                  onChange={(e) => setSeedingMethod(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="text-white font-medium">Random</div>
                  <div className="text-sm text-zinc-400">Shuffle participants randomly</div>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-800 rounded-lg">
            <div className="text-sm text-indigo-300">
              <strong>Total Participants:</strong> {registeredTeams.length + manualParticipants.length}
              {bracketFormat === "double_elim" && (() => {
                const total = registeredTeams.length + manualParticipants.length;
                const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(total)));
                const byesNeeded = nextPowerOf2 - total;
                return byesNeeded > 0 ? (
                  <span className="text-amber-300">
                    {" "}(+{byesNeeded} BYE{byesNeeded > 1 ? "s" : ""} will be added to reach {nextPowerOf2})
                  </span>
                ) : null;
              })()}
              <br />
              <strong>Format:</strong> {bracketFormat === "single_elim" ? "Single Elimination" : "Double Elimination"}
              <br />
              <strong>Seeding:</strong> {seedingMethod === "registration_order" ? "Registration Order" : "Random"}
            </div>
          </div>

          <button
            onClick={handleGenerateBracket}
            disabled={loading || (registeredTeams.length + manualParticipants.length < 2)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {loading ? "Generating..." : "Generate Bracket"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bracket Status */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bracket Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Bracket ID:</span>
                <span className="text-white font-mono text-sm">{tournament.bracketId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tournament.bracketPublished
                      ? "bg-emerald-900/30 text-emerald-300"
                      : "bg-amber-900/30 text-amber-300"
                  }`}
                >
                  {tournament.bracketPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTogglePublish}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tournament.bracketPublished
                    ? "bg-amber-600 hover:bg-amber-500"
                    : "bg-emerald-600 hover:bg-emerald-500"
                } text-white disabled:bg-zinc-700 disabled:cursor-not-allowed`}
              >
                {loading
                  ? "Processing..."
                  : tournament.bracketPublished
                  ? "Unpublish Bracket"
                  : "Publish Bracket"}
              </button>

              <a
                href={`/admin/brackets/${tournament.bracketId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors inline-block"
              >
                View & Edit Bracket
              </a>
              
              {tournament.bracketPublished && (
                <a
                  href={`/tournaments/${tournament.slug}#bracket`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors inline-block"
                >
                  View Public Page
                </a>
              )}

              <button
                onClick={handleRegenerateBracket}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {loading ? "Regenerating..." : "Regenerate Bracket"}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Note: Regenerating will delete all current match results and create a new bracket.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
