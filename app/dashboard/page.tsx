// app/dashboard/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type RegistrationItem = {
  _id: string;
  entryType: "team" | "solo";
  status: string;
  tournamentName: string;
  createdAt?: string;
  team?: { name?: string };
};

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  ign?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && (!session || !session.user?.role)) {
      signOut({ callbackUrl: "/login" });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "player") {
      router.replace("/admin/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let active = true;
    (async () => {
      try {
        setProfileLoading(true);
        setProfileError(null);
        const res = await fetch("/api/me/profile", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setProfileError(data?.error || "Failed to load profile");
        } else {
          const p = data.profile as Profile;
          setProfile({
            ...p,
            name: p.name || session?.user?.name || "",
            email: p.email || (session?.user?.email as string),
          });
        }
      } catch (err) {
        if (active) setProfileError("Network error while loading profile");
      } finally {
        if (active) setProfileLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [status, session]);

  if (
    status === "unauthenticated" ||
    !session ||
    !session.user?.role ||
    session.user.role !== "player"
  ) {
    if (status === "loading") {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Spinner />
        </div>
      );
    }
    return null;
  }

  const displayName =
    profile?.name || session.user.name || session.user.email || "Player";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="relative min-h-[85vh] max-w-4xl mx-auto py-8 px-3 flex flex-col gap-6">
      {/* subtle gamer grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),_transparent_55%)]" />
      
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mt-18">
          <span>Welcome, {displayName}</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your player profile and tournament activity in one place.
        </p>
      </div>

      {/* profile card */}
<section className="relative overflow-hidden bg-white/95 dark:bg-zinc-900/90 p-5 sm:p-6 rounded-xl shadow-lg border border-zinc-200/80 dark:border-zinc-700 backdrop-blur">
  <div className="pointer-events-none absolute inset-0 opacity-60">
    <div className="absolute -top-16 -right-24 h-40 w-40 rounded-full bg-indigo-500/40 blur-3xl" />
    <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" />
  </div>

  <div className="relative flex flex-col gap-5 sm:gap-6">
    {/* Avatar + Info + Button Row */}
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white flex items-center justify-center text-xl sm:text-2xl font-semibold shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-300/60">
          {firstLetter}
        </div>
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="font-semibold text-lg sm:text-xl flex flex-wrap items-center gap-2">
              <span className="truncate max-w-full">{displayName}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-200 border border-zinc-700 whitespace-nowrap">
                Player dashboard
              </span>
            </div>
            <div className="text-sm text-zinc-400 truncate">
              {profile?.email || session.user.email}
            </div>
          </div>

          {/* Edit Button - Stays top-right on mobile */}
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center justify-center text-sm font-medium rounded-lg px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-150 disabled:opacity-60 w-full sm:w-auto order-first sm:order-none"
            disabled={profileLoading}
          >
            {profileLoading ? "Loading…" : "Edit profile"}
          </button>
        </div>

        {/* Role + Joined */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            Role{" "}
            <span className="font-mono bg-zinc-900/60 text-zinc-100 px-2 py-0.5 rounded border border-zinc-700">
              {profile?.role || session.user.role}
            </span>
          </span>
          {profile?.createdAt && (
            <span className="inline-flex items-center gap-1">
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* IGN + Phone */}
        {(profile?.ign || profile?.phone) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
            {profile?.ign && (
              <div>
                In game name{" "}
                <span className="font-medium text-zinc-100">{profile.ign}</span>
              </div>
            )}
            {profile?.phone && (
              <div>
                Phone{" "}
                <span className="font-medium text-zinc-100">{profile.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Static tips strip */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-zinc-400 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>Keep your IGN updated so teammates can find you easily.</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
        <span>Use the same email for game and tournament accounts.</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
        <span>Complete your profile before registrations open.</span>
      </div>
    </div>
  </div>
</section>


      {/* static tips section – pure UI, no extra data */}
      <section className="bg-white/95 dark:bg-zinc-900/80 p-5 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-[0.2em] text-zinc-500">
              Lobby brief
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Quick reminders before your next tournament starts.
            </p>
          </div>
          
        </div>
        <div className="grid gap-3 sm:grid-cols-3 text-xs text-zinc-500">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 bg-zinc-50/70 dark:bg-zinc-900/80">
            <p className="font-medium text-zinc-800 dark:text-zinc-100 mb-1">
              Check match timing
            </p>
            <p>
              Confirm match time and your lobby details at least one hour before
              the tournament.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 bg-zinc-50/70 dark:bg-zinc-900/80">
            <p className="font-medium text-zinc-800 dark:text-zinc-100 mb-1">
              Stay reachable
            </p>
            <p>
              Keep your phone and email reachable so admins can contact you for
              urgent updates.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 bg-zinc-50/70 dark:bg-zinc-900/80">
            <p className="font-medium text-zinc-800 dark:text-zinc-100 mb-1">
              Warm up
            </p>
            <p>
              Join warm up queues with your regular settings so you play your
              best when it matters.
            </p>
          </div>
        </div>
      </section>

      {/* registrations */}
      <section className="bg-white/90 dark:bg-zinc-900/80 p-5 rounded-xl shadow border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span>My registrations</span>
              <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700 ">
                Activity
              </span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Track all tournaments you have joined and their current status.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-indigo-500/70 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10"
          >
            Browse tournaments
          </Link>
        </div>
        <UserRegistrations />
      </section>

      {showEdit && profile && (
        <EditProfileModal
          initialProfile={profile}
          onClose={() => setShowEdit(false)}
          onSaved={(p) => {
            setProfile(p);
            setShowEdit(false);
          }}
        />
      )}

      {profileError && (
        <p className="text-xs text-rose-400 mt-1">
          Profile error: {profileError}
        </p>
      )}
    </main>
  );
}

function Spinner() {
  return (
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
  );
}

function UserRegistrations() {
  const [items, setItems] = useState<RegistrationItem[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/me/registrations", { cache: "no-store" });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          setErr(data?.error || "Failed to load registrations");
        } else {
          const mapped: RegistrationItem[] = (data.items || []).map(
            (r: any) => ({
              _id: r._id as string,
              entryType: r.entryType,
              status: r.status,
              tournamentName: r.tournamentName,
              createdAt: r.createdAt,
              team: r.team,
            })
          );
          setItems(mapped);
        }
      } catch (err) {
        if (active) setErr("Network error");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading your registrations…</p>;
  }
  if (err) {
    return <p className="text-sm text-rose-400">{err}</p>;
  }
  if (!items || items.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        You have not registered for any tournaments yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="text-left px-4 py-3">Tournament</th>
            <th className="text-left px-4 py-3">Entry type</th>
            <th className="text-left px-4 py-3">Registered on</th>
            <th className="text-left px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const isTeam = r.entryType === "team";
            const teamName = r.team?.name;
            const entryLabel = isTeam
              ? teamName
                ? `Team · ${teamName}`
                : "Team"
              : "Solo";

            const created = r.createdAt
              ? new Date(r.createdAt).toLocaleString()
              : "Not available";

            const statusClass =
              r.status === "approved"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : r.status === "pending"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : r.status === "rejected"
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";

            return (
              <tr
                key={r._id}
                className="border-t border-zinc-200 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  {r.tournamentName}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  {entryLabel}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  {created}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type EditProfileModalProps = {
  initialProfile: Profile;
  onClose: () => void;
  onSaved: (profile: Profile) => void;
};

function EditProfileModal({
  initialProfile,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [name, setName] = useState(initialProfile.name);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [ign, setIgn] = useState(initialProfile.ign ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, ign }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to update profile");
        setSaving(false);
        return;
      }
      const updated = data.profile as Profile;
      onSaved(updated);
    } catch (err) {
      setError("Network error while saving");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-3">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 p-5 relative">
        <h3 className="text-lg font-semibold mb-1">Edit profile</h3>
        <p className="text-xs text-zinc-500 mb-4">
          Update your basic information. You can change this anytime.
        </p>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Optional phone number"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
              In game name
            </label>
            <input
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your IGN"
            />
          </div>

          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-sm rounded-lg px-3 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm font-medium rounded-lg px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
