'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [ign, setIgn] = useState(session?.user?.ign || "");
  const [phone, setPhone] = useState(session?.user?.phone || "");
  const [saving, setSaving] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    !session ||
    !session.user?.role ||
    session.user.role !== "player"
  ) {
    return null;
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ign, phone }),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  return (
    <main className="min-h-[85vh] max-w-3xl mx-auto pt-32 pb-12 px-4 flex flex-col gap-8">
      {/* Profile Section */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
          <h1 className="text-3xl font-bold text-white">
            Welcome, {session.user?.name || session.user?.email} 👋
          </h1>
          <button
            onClick={() => setEditing(true)}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
          >
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <ProfileField label="Email" value={session.user?.email || "Not set"} />
          <ProfileField label="In-Game Name" value={session.user?.ign || "Not set"} />
          <ProfileField label="Phone" value={session.user?.phone || "Not set"} />
          <ProfileField label="Role" value={session.user?.role || "Player"} />
        </div>
      </div>

      {/* My Registrations */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-indigo-400 mb-4">My Registrations</h2>
        <UserRegistrations />
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">
              Edit Profile
            </h3>
            <div className="flex flex-col gap-4">
              <label className="text-sm text-zinc-400">
                In-Game Name
                <input
                  type="text"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-indigo-500 outline-none"
                />
              </label>
              <label className="text-sm text-zinc-400">
                Phone
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:border-indigo-500 outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-zinc-400 text-xs uppercase mb-1">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  );
}

/* Registrations Component */
function UserRegistrations() {
  const [items, setItems] = useState<any[] | null>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me/registrations", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) setErr(data?.error || "Failed to load registrations");
        else setItems(data.items || []);
      } catch {
        if (active) setErr("Network error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-zinc-400">Loading...</p>;
  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!items || items.length === 0)
    return <p className="text-sm text-zinc-400">No registrations yet.</p>;

  return (
    <ul className="text-sm text-zinc-300 space-y-2">
      {items.map((r) => (
        <li
          key={r._id}
          className="flex items-center justify-between border-b border-zinc-800/50 pb-2"
        >
          <span>
            {r.tournamentName} •{" "}
            {r.entryType === "team" ? r.team?.name || "Team" : "Solo"}
          </span>
          <span
            className={[
              "font-mono px-2 py-0.5 rounded",
              r.status === "approved"
                ? "bg-emerald-900/30 text-emerald-300"
                : r.status === "pending"
                ? "bg-amber-900/30 text-amber-300"
                : r.status === "rejected"
                ? "bg-rose-900/30 text-rose-300"
                : "bg-zinc-800 text-zinc-300",
            ].join(" ")}
          >
            {r.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
