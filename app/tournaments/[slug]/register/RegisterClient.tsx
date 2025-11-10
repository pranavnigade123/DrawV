// app/tournaments/[slug]/register/RegisterClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type TournamentLite = {
  slug: string;
  name: string;
  entryType: "team" | "solo";
  teamSize?: number | null;
  status: "draft" | "open" | "ongoing" | "completed";
};

type Member = { name: string; email: string; ign: string };

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-zinc-300 mb-1">{children}</label>;
}

// FIXED: Add suppressHydrationWarning
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      suppressHydrationWarning={true} // ← THIS FIXES THE ERROR
      className={[
        "w-full rounded-lg border bg-zinc-900",
        "border-zinc-800 px-3 py-2 text-sm outline-none",
        "focus:ring-2 focus:ring-indigo-500/40",
        props.className || "",
      ].join(" ")}
    />
  );
}

function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="text-xs text-rose-400 mt-1">{children}</p>;
}

export default function RegisterClient({
  tournament,
  userId,
}: {
  tournament: TournamentLite;
  userId: string;
}) {
  const [teamName, setTeamName] = useState("");
  const [leaderIGN, setLeaderIGN] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [soloIGN, setSoloIGN] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (tournament.entryType === "team") {
      const need = Math.max((tournament.teamSize || 0) - 1, 0);
      setMembers(Array.from({ length: need }, () => ({ name: "", email: "", ign: "" })));
    }
  }, [tournament]);

  const teamSizeDisplay = useMemo(() => {
    if (tournament.entryType !== "team" || !tournament.teamSize) return "";
    return `${tournament.teamSize} players total`;
  }, [tournament]);

  function setMember(idx: number, patch: Partial<Member>) {
    setMembers((curr) => {
      const next = [...curr];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!tournament) return;

    if (tournament.entryType === "team") {
      if (!teamName.trim()) return setError("Team name is required");
      if (!leaderIGN.trim()) return setError("Leader IGN is required");
      const need = Math.max((tournament.teamSize || 0) - 1, 0);
      if (members.length !== need) return setError(`Exactly ${need} team member(s) required`);
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name.trim() || !m.ign.trim() || !/^\S+@\S+\.\S+$/.test(m.email)) {
          return setError(`Member ${i + 1} details are invalid`);
        }
      }
    } else {
      if (!soloIGN.trim()) return setError("IGN is required");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tournaments/${tournament.slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
          tournament.entryType === "team"
            ? JSON.stringify({
                teamName: teamName.trim(),
                leaderIGN: leaderIGN.trim(),
                contactPhone: contactPhone.trim() || undefined,
                members: members.map((m) => ({
                  name: m.name.trim(),
                  email: m.email.trim(),
                  ign: m.ign.trim(),
                })),
              })
            : JSON.stringify({
                ign: soloIGN.trim(),
                contactPhone: contactPhone.trim() || undefined,
              }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Registration failed");
      } else {
        setSuccessId(data.id);
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <main className="min-h-[70vh] max-w-lg mx-auto pt-24 px-4">
        <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-6">
          <h1 className="text-xl font-semibold text-emerald-300">Registration submitted</h1>
          <p className="text-sm text-zinc-300 mt-2">
            Reference ID: <span className="font-mono">{successId}</span>
          </p>
          <div className="flex gap-2 mt-4">
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-800"
            >
              Go to Dashboard
            </a>
            <a
              href={`/tournaments/${tournament.slug}`}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              Back to Tournament
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[85vh] max-w-3xl mx-auto pt-24 pb-12 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">{tournament.name}</h1>
        <p className="text-sm text-zinc-400">
          {tournament.entryType === "team" ? `Team registration • ${teamSizeDisplay}` : "Solo registration"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {tournament.entryType === "team" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Team name</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., Phoenix Five" />
              </div>
              <div>
                <Label>Leader IGN</Label>
                <Input value={leaderIGN} onChange={(e) => setLeaderIGN(e.target.value)} placeholder="e.g., RAZR" />
              </div>
            </div>

            <div>
              <Label>Contact phone (optional)</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91..." />
            </div>

            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4">
              <div className="text-sm text-zinc-300 mb-3">
                Team members ({Math.max((tournament.teamSize || 0) - 1, 0)}) — do not include the leader
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {members.map((m, i) => (
                  <div key={i} className="rounded-lg border border-zinc-800 p-3">
                    <div className="text-xs text-zinc-400 mb-2">Member {i + 1}</div>
                    <div className="space-y-2">
                      <Input
                        placeholder="Name"
                        value={m.name}
                        onChange={(e) => setMember(i, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={m.email}
                        onChange={(e) => setMember(i, { email: e.target.value })}
                      />
                      <Input
                        placeholder="IGN"
                        value={m.ign}
                        onChange={(e) => setMember(i, { ign: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <Label>IGN</Label>
                <Input value={soloIGN} onChange={(e) => setSoloIGN(e.target.value)} placeholder="e.g., RAZR" />
              </div>
              <div className="md:col-span-1">
                <Label>Contact phone (optional)</Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91..." />
              </div>
            </div>
          </>
        )}

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit registration"}
          </button>
          <a
            href={`/tournaments/${tournament.slug}`}
            className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}