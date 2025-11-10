// app/tournaments/[slug]/page.tsx
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Registration from "@/lib/models/Registration";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function formatDate(d?: Date | null) {
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(d));
  } catch {
    return "—";
  }
}

function formatRange(start?: Date | null, end?: Date | null) {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s === "—" && e === "—") return "—";
  if (s !== "—" && e !== "—") return `${s} – ${e}`;
  return s !== "—" ? s : e;
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "open"
      ? "bg-emerald-900/30 text-emerald-300"
      : status === "ongoing"
      ? "bg-indigo-900/30 text-indigo-300"
      : "bg-zinc-800 text-zinc-300";
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

export default async function TournamentDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  await connectDB();

  const t = await Tournament.findOne({
    slug,
    archivedAt: null,
  })
    .select(
      "name slug game status coverImage description rules format entryType teamSize registrationOpenAt registrationCloseAt startDate endDate"
    )
    .lean();

  if (!t || t.status === "draft") {
    notFound();
  }

  const isOpen = t.status === "open";

  // Check if user is already registered
  let isRegistered = false;
  if (userId && isOpen) {
    const reg = await Registration.findOne({
      tournamentId: t._id,
      $or: [
        { "solo.userId": userId },
        { "team.leader.userId": userId },
      ],
      status: { $in: ["approved", "pending"] },
    }).lean();

    isRegistered = !!reg;
  }

  // Helper: build login redirect URL
  const loginRedirectUrl = `/login?callbackUrl=${encodeURIComponent(
    `/tournaments/${slug}/register`
  )}`;

  return (
    <div className="mx-auto max-w-5xl px-3 md:px-0 py-6 md:py-8 mt-24">
      <div className="rounded-2xl border border-zinc-800/70 overflow-hidden bg-zinc-900/60">
        {t.coverImage ? (
          <img
            src={t.coverImage}
            alt={t.name}
            className="h-56 w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-12 w-full bg-gradient-to-r from-zinc-900 to-zinc-950" />
        )}

        <div className="p-5 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-50">
                {t.name}
              </h1>
              <div className="mt-1 text-sm text-zinc-400">{t.game || "—"}</div>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={t.status} />

              {/* Registration Button Logic */}
              {isOpen && (
                <>
                  {userId ? (
                    isRegistered ? (
                      // Already Registered
                      <span className="inline-flex items-center rounded-lg bg-emerald-900/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
                        Already Registered
                      </span>
                    ) : (
                      // Logged-in & eligible
                      <Link
                        href={`/tournaments/${t.slug}/register`}
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                      >
                        Register
                      </Link>
                    )
                  ) : (
                    // Guest → Login to Register
                    <Link
                      href={loginRedirectUrl}
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600"
                    >
                      Register
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-800/70 p-4">
              <div className="text-xs text-zinc-400">Registration</div>
              <div className="text-sm mt-1">
                {formatRange(
                  t.registrationOpenAt as any,
                  t.registrationCloseAt as any
                )}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 p-4">
              <div className="text-xs text-zinc-400">Event dates</div>
              <div className="text-sm mt-1">
                {formatRange(t.startDate as any, t.endDate as any)}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 p-4">
              <div className="text-xs text-zinc-400">Format / Entry</div>
              <div className="text-sm mt-1 capitalize">
                {String(t.format || "—").replaceAll("_", " ")} • {t.entryType}
                {t.entryType === "team" && (t as any).teamSize
                  ? ` • ${(t as any).teamSize} players`
                  : ""}
              </div>
            </div>
          </div>

          {t.description ? (
            <section className="mt-2">
              <h2 className="text-sm font-semibold text-zinc-100">Overview</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300 whitespace-pre-wrap">
                {t.description}
              </p>
            </section>
          ) : null}

          {t.rules ? (
            <section>
              <h2 className="text-sm font-semibold text-zinc-100">Rules</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300 whitespace-pre-wrap">
                {t.rules}
              </p>
            </section>
          ) : null}
        </div>
      </div>

      {!isOpen && (
        <div className="mt-4 text-xs text-zinc-400">
          Registration is currently not open for this tournament.
        </div>
      )}
    </div>
  );
}