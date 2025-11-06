"use client";

import { useEffect, useState } from "react";

type Tournament = { _id?: string; name: string; slug: string };

export default function EmailBlast() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch tournaments for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tournaments");
        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setTournaments(list);
      } catch (e) {
        console.error("fetch tournaments failed", e);
        setTournaments([]);
      }
    })();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return alert("Message cannot be empty.");

    setSending(true);
    try {
      const res = await fetch("/api/admin/email-blast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentSlug: selected || undefined,
          message,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to send email.");
      } else {
        alert(`✅ Email sent to ${data.count} recipient(s)!`);
        setMessage("");
        setSelected("");
      }
    } catch (err) {
      alert("Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-5 text-white">
      <h3 className="text-lg font-semibold mb-4">Email Blast</h3>

      <form onSubmit={handleSend} className="flex flex-col gap-3">
        {/* Tournament Selector */}
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/40 outline-none"
        >
          <option value="">All Users</option>
          {tournaments.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>

        {/* Message Box */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your announcement message..."
          rows={5}
          className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-white resize-none focus:ring-2 focus:ring-indigo-500/40 outline-none"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={sending}
          className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg text-white font-semibold transition-all duration-200"
        >
          {sending ? "Sending..." : "Send Email"}
        </button>

        <p className="text-xs text-zinc-500 mt-1">
          Tip: Leave tournament blank to email <span className="text-indigo-400">all users</span>.
        </p>
      </form>
    </div>
  );
}
