// app/tournaments/page.tsx
import { connectDB } from "@/lib/db";
import Tournament from "@/lib/models/Tournament";
import Link from "next/link";

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
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default async function TournamentsPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(parseInt(sp.page || "1", 10) || 1, 1);
  const PAGE_SIZE = 24;
  const skip = (page - 1) * PAGE_SIZE;

  await connectDB();

  const items = await Tournament.find({
    archivedAt: null,
    status: { $in: ["open", "ongoing", "completed"] },
  })
    .select(
      "name slug game status coverImage description registrationOpenAt registrationCloseAt startDate endDate createdAt"
    )
    .lean();

  const enriched = items.map((t: any) => {
    let bucket = 3;
    let key = 0;
    if (t.status === "open") {
      bucket = 1;
      key = new Date(t.registrationCloseAt || t.startDate || t.createdAt).getTime();
    } else if (t.status === "ongoing") {
      bucket = 2;
      key = new Date(t.endDate || t.startDate || t.createdAt).getTime();
    } else {
      bucket = 3;
      key = -new Date(t.endDate || t.createdAt).getTime();
    }
    return { ...t, __bucket: bucket, __key: key };
  });

  enriched.sort((a: any, b: any) => {
    if (a.__bucket !== b.__bucket) return a.__bucket - b.__bucket;
    return a.__bucket === 3 ? a.__key - b.__key : a.__key - b.__key;
  });

  const total = enriched.length;
  const paged = enriched.slice(skip, skip + PAGE_SIZE);
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className="mx-auto max-w-6xl px-3 md:px-0 py-6 md:py-8 mt-30">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
          Tournaments
        </h1>
        <p className="text-sm text-zinc-400 mb-8">
          Browse open, ongoing, and recently completed tournaments.
        </p>
      </div>

      {paged.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/70 p-8 text-center text-sm text-zinc-400">
          No tournaments available right now.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {paged.map((t: any) => (
            <li
              key={t.slug}
              className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 overflow-hidden"
            >
              {t.coverImage ? (
                
                <img
                  src={t.coverImage}
                  alt={t.name}
                  className="h-32 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-2 w-full bg-gradient-to-r from-zinc-900 to-zinc-950" />
              )}

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                    {t.name}
                  </h2>
                  <StatusBadge status={t.status} />
                </div>

                <div className="text-xs text-zinc-400">
                  {t.game || "—"}
                </div>

                <div className="text-xs text-zinc-400">
                  Reg: {formatRange(t.registrationOpenAt, t.registrationCloseAt)}
                </div>
                <div className="text-xs text-zinc-400">
                  Event: {formatRange(t.startDate, t.endDate)}
                </div>

                <div className="pt-2">
                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <div className="text-zinc-400">
            Page {page} of {totalPages} • {total} total
          </div>
          <div className="flex gap-2">
            <Link
              href={`/tournaments?page=${Math.max(page - 1, 1)}`}
              aria-disabled={page === 1}
              className={[
                "px-3 py-1.5 rounded-lg border",
                page === 1
                  ? "pointer-events-none opacity-40 border-zinc-700"
                  : "hover:bg-zinc-800 border-zinc-700",
              ].join(" ")}
            >
              Prev
            </Link>
            <Link
              href={`/tournaments?page=${page + 1}`}
              aria-disabled={page === totalPages}
              className={[
                "px-3 py-1.5 rounded-lg border",
                page === totalPages
                  ? "pointer-events-none opacity-40 border-zinc-700"
                  : "hover:bg-zinc-800 border-zinc-700",
              ].join(" ")}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
